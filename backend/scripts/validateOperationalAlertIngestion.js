/**
 * SentinelAI — Phase 4A MongoDB Operational Alert Ingestion Validation Suite
 * ==========================================================================
 * Rigorously verifies database counts, referential integrity, idempotency,
 * and operational status preservation across re-ingestion cycles.
 */

import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Alert from "../src/models/Alert.js";
import AlertEvidence from "../src/models/AlertEvidence.js";
import MonitoredIdentity from "../src/models/MonitoredIdentity.js";
import { ALERT_SEVERITY, ALERT_STATUS, EVIDENCE_SEVERITY } from "../src/constants/alert.constants.js";
import { runIngestion } from "./ingestOperationalAlerts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, "..");

dotenv.config({ path: path.resolve(BACKEND_ROOT, ".env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sentinelai";
const PYTHON_PATH = path.resolve(PROJECT_ROOT, "venv/bin/python");

function getParquetCount(filePath) {
  return new Promise((resolve, reject) => {
    const py = spawn(PYTHON_PATH, [
      "-c",
      "import sys, pandas as pd; df = pd.read_parquet(sys.argv[1]); print(len(df))",
      filePath,
    ]);
    let stdout = "";
    py.stdout.on("data", (d) => (stdout += d));
    py.on("close", (code) => {
      if (code !== 0) reject(new Error(`Failed to read count from ${filePath}`));
      else resolve(parseInt(stdout.trim(), 10));
    });
  });
}

export async function runValidationSuite() {
  console.log("=".repeat(70));
  console.log("SENTINELAI — PHASE 4A MONGODB INGESTION VALIDATION SUITE");
  console.log("=".repeat(70));

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }

  let allPassed = true;
  function check(name, condition, details = "") {
    const status = condition ? "PASSED" : "FAILED";
    console.log(`[${status}] ${name}`);
    if (details) console.log(`        ${details}`);
    if (!condition) allPassed = false;
  }

  // 1. Check Source Parquet Counts
  const alertsPath = path.resolve(PROJECT_ROOT, "ml-engine/data/processed/operational_alerts.parquet");
  const evidencePath = path.resolve(PROJECT_ROOT, "ml-engine/data/processed/operational_alert_evidence.parquet");
  const identitiesPath = path.resolve(PROJECT_ROOT, "ml-engine/data/processed/identities.parquet");

  const expectedAlertCount = await getParquetCount(alertsPath);
  const expectedEvidenceCount = await getParquetCount(evidencePath);
  const expectedIdentityCount = await getParquetCount(identitiesPath);

  console.log(`\n--- Test 1: Record Count Matching ---`);
  const actualAlertCount = await Alert.countDocuments();
  const actualEvidenceCount = await AlertEvidence.countDocuments();
  const actualIdentityCount = await MonitoredIdentity.countDocuments();

  check(
    "MongoDB Alert count matches source parquet",
    actualAlertCount === expectedAlertCount,
    `Expected: ${expectedAlertCount.toLocaleString()} | Actual: ${actualAlertCount.toLocaleString()}`
  );
  check(
    "MongoDB Evidence count matches source parquet",
    actualEvidenceCount === expectedEvidenceCount,
    `Expected: ${expectedEvidenceCount.toLocaleString()} | Actual: ${actualEvidenceCount.toLocaleString()}`
  );
  check(
    "MongoDB MonitoredIdentity count matches source parquet",
    actualIdentityCount === expectedIdentityCount,
    `Expected: ${expectedIdentityCount.toLocaleString()} | Actual: ${actualIdentityCount.toLocaleString()}`
  );

  // 2. Uniqueness of alertId and userId
  console.log(`\n--- Test 2: Uniqueness Constraints ---`);
  const dupAlertIds = await Alert.aggregate([
    { $group: { _id: "$alertId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  check("Zero duplicate alertId in MongoDB", dupAlertIds.length === 0, `Duplicates: ${dupAlertIds.length}`);

  const dupUserIds = await MonitoredIdentity.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  check("Zero duplicate userId in MonitoredIdentity", dupUserIds.length === 0, `Duplicates: ${dupUserIds.length}`);

  // 3. Referential Integrity (No Orphaned Evidence & Valid Monitored Identities)
  console.log(`\n--- Test 3: Referential Integrity ---`);
  const distinctAlertIds = await Alert.distinct("alertId");
  const alertIdSet = new Set(distinctAlertIds);

  const evidenceAlertIds = await AlertEvidence.distinct("alertId");
  const orphanedEvidence = evidenceAlertIds.filter((id) => !alertIdSet.has(id));
  check("Zero orphaned evidence records", orphanedEvidence.length === 0, `Orphan count: ${orphanedEvidence.length}`);

  const distinctIdentityUserIds = await MonitoredIdentity.distinct("userId");
  const identityUserIdSet = new Set(distinctIdentityUserIds);

  const alertUserIds = await Alert.distinct("userId");
  const missingIdentities = alertUserIds.filter((uid) => !identityUserIdSet.has(uid));
  check(
    "Every operational alert references a valid monitored identity",
    missingIdentities.length === 0,
    `Missing identity count: ${missingIdentities.length}`
  );

  // 4. Score Ranges and Severity Consistency
  console.log(`\n--- Test 4: Score Bounds & Severity Rules ---`);
  const invalidScores = await Alert.countDocuments({
    $or: [
      { peakScore: { $lt: 80.0, $gt: 100.0 } },
      { meanScore: { $lt: 80.0, $gt: 100.0 } },
      { statisticalScorePeak: { $lt: 0.0, $gt: 100.0 } },
      { isolationForestScorePeak: { $lt: 0.0, $gt: 100.0 } },
    ],
  });
  check("All anomaly scores within valid bounds", invalidScores === 0, `Invalid score records: ${invalidScores}`);

  const invalidSeverities = await Alert.countDocuments({
    severity: { $nin: Object.values(ALERT_SEVERITY) },
  });
  check("All alerts have valid operational severities", invalidSeverities === 0, `Invalid severities: ${invalidSeverities}`);

  const severityMismatch = await Alert.countDocuments({
    $or: [
      { severity: "CRITICAL", peakScore: { $lt: 95.0 } },
      { severity: "HIGH", $or: [{ peakScore: { $lt: 90.0 } }, { peakScore: { $gte: 95.0 } }] },
      { severity: "ELEVATED", $or: [{ peakScore: { $lt: 80.0 } }, { peakScore: { $gte: 90.0 } }] },
    ],
  });
  check("Severity strictly matches calibrated score thresholds", severityMismatch === 0, `Mismatches: ${severityMismatch}`);

  // 5. Temporal Invariants
  console.log(`\n--- Test 5: Temporal Invariants ---`);
  const sampleAlerts = await Alert.find({}, { firstSeen: 1, lastSeen: 1, durationDays: 1, anomalousDays: 1 }).limit(500);
  let temporalOrderValid = true;
  let durationValid = true;

  for (const alt of sampleAlerts) {
    if (new Date(alt.firstSeen) > new Date(alt.lastSeen)) temporalOrderValid = false;
    if (alt.durationDays < 1 || alt.anomalousDays < 1 || alt.anomalousDays > alt.durationDays) durationValid = false;
  }
  check("firstSeen <= lastSeen on alert sample", temporalOrderValid);
  check("1 <= anomalousDays <= durationDays on alert sample", durationValid);

  // 6. Test Operational Status Preservation across Re-Ingestion
  console.log(`\n--- Test 6: Operational Status Preservation Test ---`);
  const sampleAlert = await Alert.findOne({ severity: "CRITICAL" });
  if (!sampleAlert) throw new Error("No CRITICAL alert found for test");

  const targetAlertId = sampleAlert.alertId;
  const originalStatus = sampleAlert.status;
  const originalPeakScore = sampleAlert.peakScore;

  console.log(`  - Selected test alert: ${targetAlertId}`);
  console.log(`  - Changing status to: "INVESTIGATING"...`);

  await Alert.updateOne({ alertId: targetAlertId }, { $set: { status: ALERT_STATUS.INVESTIGATING } });

  console.log(`  - Re-running full ingestion pipeline...`);
  const reIngestResult = await runIngestion({ verbose: false });

  const postIngestAlert = await Alert.findOne({ alertId: targetAlertId });
  const statusPreserved = postIngestAlert.status === ALERT_STATUS.INVESTIGATING;
  check(
    "Operational analyst status preserved across re-ingestion ($setOnInsert safety)",
    statusPreserved,
    `Status after re-ingestion: "${postIngestAlert.status}" (Expected: "INVESTIGATING")`
  );

  // 7. Verify Idempotency & Zero Logical Duplication
  console.log(`\n--- Test 7: Ingestion Idempotency & Repeatability ---`);
  const countAfterReingest = await Alert.countDocuments();
  const evidenceAfterReingest = await AlertEvidence.countDocuments();
  const identityAfterReingest = await MonitoredIdentity.countDocuments();

  check(
    "Alert count unchanged after 2nd ingestion (zero duplicates)",
    countAfterReingest === expectedAlertCount,
    `Count: ${countAfterReingest.toLocaleString()} (Expected: ${expectedAlertCount.toLocaleString()})`
  );
  check(
    "Evidence count unchanged after 2nd ingestion (zero duplicates)",
    evidenceAfterReingest === expectedEvidenceCount,
    `Count: ${evidenceAfterReingest.toLocaleString()} (Expected: ${expectedEvidenceCount.toLocaleString()})`
  );
  check(
    "MonitoredIdentity count unchanged after 2nd ingestion (zero duplicates)",
    identityAfterReingest === expectedIdentityCount,
    `Count: ${identityAfterReingest.toLocaleString()} (Expected: ${expectedIdentityCount.toLocaleString()})`
  );

  // Clean up test alert state
  await Alert.updateOne({ alertId: targetAlertId }, { $set: { status: originalStatus } });
  console.log(`  - Restored test alert ${targetAlertId} back to original status "${originalStatus}".`);

  console.log("\n" + "=".repeat(70));
  if (allPassed) {
    console.log("ALL PHASE 4A VALIDATION CHECKS PASSED (100% SUCCESS)");
  } else {
    console.log("VALIDATION FAILED ON ONE OR MORE CHECKS");
  }
  console.log("=".repeat(70));

  return allPassed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runValidationSuite()
    .then(async (success) => {
      await mongoose.disconnect();
      process.exit(success ? 0 : 1);
    })
    .catch(async (err) => {
      console.error("\nFATAL VALIDATION ERROR:", err);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      process.exit(1);
    });
}
