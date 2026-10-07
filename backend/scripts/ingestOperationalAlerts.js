/**
 * SentinelAI — Phase 4A Operational Alert & Identity Ingestion Pipeline
 * =====================================================================
 * Ingests validated Phase 3B operational datasets into MongoDB with strict
 * idempotency, pre-write validation, and operational state preservation.
 *
 * Source Datasets:
 * ----------------
 * 1. ml-engine/data/processed/identities.parquet (1,000 monitored employees)
 * 2. ml-engine/data/processed/operational_alerts.parquet (18,056 investigation episodes)
 * 3. ml-engine/data/processed/operational_alert_evidence.parquet (36,532 evidence records)
 *
 * Operational State Safety Rule:
 * ------------------------------
 * When an alert is re-ingested:
 * - All ML-derived metrics and evidence are refreshed ($set).
 * - Analyst/operational state (`status`, `acknowledgedAt`, `resolvedAt`, `createdAt`)
 *   is strictly preserved ($setOnInsert) and NEVER overwritten.
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, "..");

dotenv.config({ path: path.resolve(BACKEND_ROOT, ".env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sentinelai";
const PYTHON_PATH = path.resolve(PROJECT_ROOT, "venv/bin/python");

/**
 * Executes a Python script to export parquet files as clean JSON arrays.
 */
function readParquetAsJson(filePath) {
  return new Promise((resolve, reject) => {
    const pyScript = `
import sys, json, pandas as pd
df = pd.read_parquet(sys.argv[1])
# Convert timestamps/dates to ISO strings
for col in df.select_dtypes(include=['datetime64', 'datetime64[ns]']).columns:
    df[col] = df[col].dt.strftime('%Y-%m-%dT%H:%M:%S.000Z')
print(df.to_json(orient='records', date_format='iso'))
`;
    const py = spawn(PYTHON_PATH, ["-c", pyScript, filePath], {
      maxBuffer: 1024 * 1024 * 300, // 300MB buffer for large datasets
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    py.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python parquet export failed with code ${code}: ${stderr}`));
      }
      try {
        const records = JSON.parse(stdout);
        resolve(records);
      } catch (err) {
        reject(new Error(`Failed to parse JSON from Python output: ${err.message}`));
      }
    });
  });
}

/**
 * Validates in-memory records against strict Phase 4A schema invariants before MongoDB operations.
 */
function validateSourceData(identities, alerts, evidenceList) {
  console.log("\n--- Step 1: Pre-Ingestion Data Invariant Validation ---");
  const alertIdsSet = new Set();
  const userIdsSet = new Set();

  // 1. Validate Monitored Identities
  for (const ident of identities) {
    if (!ident.user_id) throw new Error("Validation Error: Missing user_id in identity record");
    if (!ident.employee_name) throw new Error(`Validation Error: Missing employee_name for ${ident.user_id}`);
    if (!ident.email) throw new Error(`Validation Error: Missing email for ${ident.user_id}`);
    userIdsSet.add(ident.user_id);
  }
  console.log(`[PASSED] ${identities.length} Monitored Identities validated (all unique user_ids).`);

  // 2. Validate Operational Alerts
  const validSeverities = new Set(Object.values(ALERT_SEVERITY));
  for (const alt of alerts) {
    if (!alt.alert_id) throw new Error("Validation Error: Missing alert_id in alert record");
    if (alertIdsSet.has(alt.alert_id)) throw new Error(`Validation Error: Duplicate alert_id found in source: ${alt.alert_id}`);
    alertIdsSet.add(alt.alert_id);

    if (!alt.user_id) throw new Error(`Validation Error: Alert ${alt.alert_id} missing user_id`);
    if (!validSeverities.has(alt.severity)) {
      throw new Error(`Validation Error: Invalid severity "${alt.severity}" in alert ${alt.alert_id}`);
    }

    if (alt.peak_score < 80.0 || alt.peak_score > 100.0) {
      throw new Error(`Validation Error: Peak score ${alt.peak_score} out of operational bounds [80, 100] in ${alt.alert_id}`);
    }
    if (alt.mean_score < 80.0 || alt.mean_score > 100.0) {
      throw new Error(`Validation Error: Mean score ${alt.mean_score} out of operational bounds [80, 100] in ${alt.alert_id}`);
    }
    if (alt.peak_score < alt.mean_score) {
      throw new Error(`Validation Error: peak_score < mean_score in alert ${alt.alert_id}`);
    }
    if (alt.duration_days < 1) {
      throw new Error(`Validation Error: duration_days < 1 in alert ${alt.alert_id}`);
    }
    if (alt.anomalous_days < 1) {
      throw new Error(`Validation Error: anomalous_days < 1 in alert ${alt.alert_id}`);
    }
    if (new Date(alt.first_seen) > new Date(alt.last_seen)) {
      throw new Error(`Validation Error: first_seen > last_seen in alert ${alt.alert_id}`);
    }
  }
  console.log(`[PASSED] ${alerts.length} Operational Alerts validated (all unique alert_ids, valid scores & dates).`);

  // 3. Validate Evidence
  const validEvSeverities = new Set(Object.values(EVIDENCE_SEVERITY));
  for (const ev of evidenceList) {
    if (!ev.alert_id) throw new Error("Validation Error: Missing alert_id in evidence record");
    if (!alertIdsSet.has(ev.alert_id)) {
      throw new Error(`Validation Error: Orphaned evidence record referencing non-existent alert ${ev.alert_id}`);
    }
    if (!ev.evidence_type) throw new Error(`Validation Error: Missing evidence_type in alert ${ev.alert_id}`);
    if (!validEvSeverities.has(ev.severity)) {
      throw new Error(`Validation Error: Invalid evidence severity "${ev.severity}" in alert ${ev.alert_id}`);
    }
    if (typeof ev.dimension_value !== "number" || isNaN(ev.dimension_value)) {
      throw new Error(`Validation Error: Invalid dimension_value in evidence for alert ${ev.alert_id}`);
    }
  }
  console.log(`[PASSED] ${evidenceList.length} Evidence records validated (zero orphans, all foreign keys valid).`);
}

/**
 * Main ingestion routine.
 */
export async function runIngestion(options = {}) {
  const { verbose = true } = options;
  if (verbose) {
    console.log("=".repeat(70));
    console.log("SENTINELAI — PHASE 4A MONGODB OPERATIONAL ALERT INGESTION");
    console.log("=".repeat(70));
  }

  // 1. Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
    if (verbose) console.log(`Connected to MongoDB: ${MONGODB_URI}`);
  }

  // 2. Initialize Indexes
  await MonitoredIdentity.init();
  await Alert.init();
  await AlertEvidence.init();
  if (verbose) console.log("MongoDB Indexes verified and initialized.");

  // 3. Load Source Datasets
  const identitiesPath = path.resolve(PROJECT_ROOT, "ml-engine/data/processed/identities.parquet");
  const alertsPath = path.resolve(PROJECT_ROOT, "ml-engine/data/processed/operational_alerts.parquet");
  const evidencePath = path.resolve(PROJECT_ROOT, "ml-engine/data/processed/operational_alert_evidence.parquet");

  if (verbose) console.log("\nReading parquet datasets via Python bridge...");
  const [identitiesRaw, alertsRaw, evidenceRaw] = await Promise.all([
    readParquetAsJson(identitiesPath),
    readParquetAsJson(alertsPath),
    readParquetAsJson(evidencePath),
  ]);

  if (verbose) {
    console.log(`  - Monitored Identities: ${identitiesRaw.length.toLocaleString()} rows`);
    console.log(`  - Operational Alerts:   ${alertsRaw.length.toLocaleString()} rows`);
    console.log(`  - Evidence Records:     ${evidenceRaw.length.toLocaleString()} rows`);
  }

  // 4. Validate Datasets
  validateSourceData(identitiesRaw, alertsRaw, evidenceRaw);

  // 5. Ingest Monitored Identities
  if (verbose) console.log("\n--- Step 2: Ingesting Monitored Identities ---");
  const identityOps = identitiesRaw.map((ident) => ({
    updateOne: {
      filter: { userId: ident.user_id },
      update: {
        $set: {
          employeeName: ident.employee_name,
          email: ident.email,
          role: ident.role || "Unknown",
          businessUnit: ident.business_unit || "Corporate",
          functionalUnit: ident.functional_unit || "General",
          department: ident.department || "General",
          team: ident.team || "General",
          supervisor: ident.supervisor || "Executive / Self",
          firstSeen: ident.first_seen ? new Date(ident.first_seen) : null,
          lastSeen: ident.last_seen ? new Date(ident.last_seen) : null,
        },
      },
      upsert: true,
    },
  }));

  const identResult = await MonitoredIdentity.bulkWrite(identityOps, { ordered: false });
  if (verbose) {
    console.log(`Monitored Identities BulkWrite Result:`);
    console.log(`  - Matched:   ${identResult.matchedCount.toLocaleString()}`);
    console.log(`  - Inserted:  ${identResult.upsertedCount.toLocaleString()}`);
    console.log(`  - Modified:  ${identResult.modifiedCount.toLocaleString()}`);
  }

  // 6. Ingest Operational Alerts
  if (verbose) console.log("\n--- Step 3: Ingesting Operational Alerts ---");
  const BATCH_SIZE = 2500;
  let totalAlertsInserted = 0;
  let totalAlertsModified = 0;
  let totalAlertsMatched = 0;

  for (let i = 0; i < alertsRaw.length; i += BATCH_SIZE) {
    const batch = alertsRaw.slice(i, i + BATCH_SIZE);
    const alertOps = batch.map((alt) => {
      // Parse JSON fields safely
      let scoreTrajectory = [];
      let evidenceSummary = [];
      let contributingDimensions = {};

      try {
        scoreTrajectory = typeof alt.score_trajectory === "string" ? JSON.parse(alt.score_trajectory) : alt.score_trajectory || [];
      } catch (e) {}

      try {
        evidenceSummary = typeof alt.evidence === "string" ? JSON.parse(alt.evidence) : alt.evidence || [];
      } catch (e) {}

      try {
        contributingDimensions = typeof alt.detector_contributing_dimensions === "string" ? JSON.parse(alt.detector_contributing_dimensions) : alt.detector_contributing_dimensions || {};
      } catch (e) {}

      return {
        updateOne: {
          filter: { alertId: alt.alert_id },
          update: {
            $set: {
              userId: alt.user_id,
              employeeName: alt.employee_name,
              email: alt.email,
              role: alt.role || "Unknown",
              businessUnit: alt.business_unit || "Corporate",
              department: alt.department || "General",
              team: alt.team || "General",
              supervisor: alt.supervisor || "Executive / Self",
              severity: alt.severity,
              peakScore: Number(alt.peak_score),
              meanScore: Number(alt.mean_score),
              firstSeen: new Date(alt.first_seen),
              lastSeen: new Date(alt.last_seen),
              durationDays: Number(alt.duration_days),
              anomalousDays: Number(alt.anomalous_days),
              scoreTrajectory,
              statisticalScorePeak: Number(alt.statistical_score_peak),
              isolationForestScorePeak: Number(alt.isolation_forest_score_peak),
              newDeviceDays: Number(alt.new_device_days || 0),
              afterHoursDays: Number(alt.after_hours_days || 0),
              fileBurstDays: Number(alt.file_burst_days || 0),
              deviceFileSequenceDays: Number(alt.device_file_sequence_days || 0),
              weekendActivityDays: Number(alt.weekend_activity_days || 0),
              activitySummary: alt.activity_summary,
              evidenceSummary,
              contributingDimensions,
            },
            // Operational state safety: preserve analyst status on re-ingestion!
            $setOnInsert: {
              status: ALERT_STATUS.OPEN,
              acknowledgedAt: null,
              resolvedAt: null,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    const alertBatchResult = await Alert.bulkWrite(alertOps, { ordered: false });
    totalAlertsInserted += alertBatchResult.upsertedCount;
    totalAlertsModified += alertBatchResult.modifiedCount;
    totalAlertsMatched += alertBatchResult.matchedCount;
  }

  if (verbose) {
    console.log(`Operational Alerts BulkWrite Result:`);
    console.log(`  - Matched:   ${totalAlertsMatched.toLocaleString()}`);
    console.log(`  - Inserted:  ${totalAlertsInserted.toLocaleString()}`);
    console.log(`  - Modified:  ${totalAlertsModified.toLocaleString()}`);
  }

  // 7. Ingest Alert Evidence
  if (verbose) console.log("\n--- Step 4: Ingesting Alert Evidence ---");
  let totalEvidenceInserted = 0;
  let totalEvidenceModified = 0;
  let totalEvidenceMatched = 0;

  for (let i = 0; i < evidenceRaw.length; i += BATCH_SIZE) {
    const batch = evidenceRaw.slice(i, i + BATCH_SIZE);
    const evidenceOps = batch.map((ev) => ({
      updateOne: {
        filter: {
          alertId: ev.alert_id,
          evidenceType: ev.evidence_type,
          dimension: ev.dimension,
        },
        update: {
          $set: {
            userId: ev.user_id,
            evidenceType: ev.evidence_type,
            severity: ev.severity || EVIDENCE_SEVERITY.MEDIUM,
            description: ev.description,
            dimension: ev.dimension,
            dimensionValue: Number(ev.dimension_value),
          },
        },
        upsert: true,
      },
    }));

    const evBatchResult = await AlertEvidence.bulkWrite(evidenceOps, { ordered: false });
    totalEvidenceInserted += evBatchResult.upsertedCount;
    totalEvidenceModified += evBatchResult.modifiedCount;
    totalEvidenceMatched += evBatchResult.matchedCount;
  }

  if (verbose) {
    console.log(`Alert Evidence BulkWrite Result:`);
    console.log(`  - Matched:   ${totalEvidenceMatched.toLocaleString()}`);
    console.log(`  - Inserted:  ${totalEvidenceInserted.toLocaleString()}`);
    console.log(`  - Modified:  ${totalEvidenceModified.toLocaleString()}`);
  }

  // 8. Final Count Verification
  const finalAlertCount = await Alert.countDocuments();
  const finalEvidenceCount = await AlertEvidence.countDocuments();
  const finalIdentityCount = await MonitoredIdentity.countDocuments();

  if (verbose) {
    console.log("\n" + "=".repeat(70));
    console.log("PHASE 4A INGESTION SUMMARY REPORT");
    console.log("=".repeat(70));
    console.log(`Source Alert Count:              ${alertsRaw.length.toLocaleString()}`);
    console.log(`MongoDB Alerts Total:            ${finalAlertCount.toLocaleString()}`);
    console.log(`Alerts Inserted (New):           ${totalAlertsInserted.toLocaleString()}`);
    console.log(`Alerts Updated (Existing):       ${totalAlertsModified.toLocaleString()}`);
    console.log("-".repeat(70));
    console.log(`Source Evidence Count:           ${evidenceRaw.length.toLocaleString()}`);
    console.log(`MongoDB Evidence Total:          ${finalEvidenceCount.toLocaleString()}`);
    console.log(`Evidence Inserted (New):         ${totalEvidenceInserted.toLocaleString()}`);
    console.log(`Evidence Updated (Existing):     ${totalEvidenceModified.toLocaleString()}`);
    console.log("-".repeat(70));
    console.log(`Source Identity Count:           ${identitiesRaw.length.toLocaleString()}`);
    console.log(`MongoDB Identities Total:        ${finalIdentityCount.toLocaleString()}`);
    console.log(`Identities Inserted (New):       ${identResult.upsertedCount.toLocaleString()}`);
    console.log("=".repeat(70));
  }

  return {
    sourceAlerts: alertsRaw.length,
    finalAlertCount,
    alertsInserted: totalAlertsInserted,
    alertsModified: totalAlertsModified,
    sourceEvidence: evidenceRaw.length,
    finalEvidenceCount,
    evidenceInserted: totalEvidenceInserted,
    evidenceModified: totalEvidenceModified,
    sourceIdentities: identitiesRaw.length,
    finalIdentityCount,
    identitiesInserted: identResult.upsertedCount,
  };
}

// Direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIngestion()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("\nFATAL INGESTION ERROR:", err);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      process.exit(1);
    });
}
