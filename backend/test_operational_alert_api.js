/**
 * SentinelAI — Phase 4B Operational Alert REST API Test Suite
 * ============================================================
 * Self-contained automated test suite covering all 20+ required API scenarios:
 * - Authentication enforcement (401)
 * - Filtering (severity, status, department, role, dates, search)
 * - Pagination & Maximum Limit Bounds
 * - Sort Field Whitelisting & Direction
 * - Alert Details & Monitored Identity resolution
 * - Alert Evidence pagination & filtering
 * - Status transition state machine & timestamp validation
 * - ML field tampering protection
 * - Error formats & 404/400/409 handling
 */

import http from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import app from "./src/app.js";
import { env } from "./src/config/env.js";
import User from "./src/models/User.js";
import Alert from "./src/models/Alert.js";
import { ALERT_SEVERITY, ALERT_STATUS } from "./src/constants/alert.constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function runTestSuite() {
  console.log("=".repeat(70));
  console.log("SENTINELAI — PHASE 4B OPERATIONAL ALERT REST API TEST SUITE");
  console.log("=".repeat(70));

  // 1. Connect DB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // 2. Start ephemeral in-memory HTTP server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const BASE_URL = `http://localhost:${port}/api/v1`;

  console.log(`Ephemeral test server listening on port ${port}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, description, details = "") {
    if (condition) {
      console.log(`  [PASSED] ${description}`);
      passed++;
    } else {
      console.error(`  [FAILED] ${description}`);
      if (details) console.error(`           Details: ${details}`);
      failed++;
    }
  }

  try {
    // 3. Setup Authenticated Analyst Account & JWT Cookie
    const testEmail = `analyst_test_${Date.now()}@sentinelai.internal`;
    let testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      testUser = new User({
        email: testEmail,
        name: "Security Analyst",
        roles: ["analyst"],
        isActive: true,
      });
      await testUser.setPassword("AnalystSecurePassword123!");
      await testUser.save();
    }

    const token = jwt.sign({ id: testUser._id }, env.JWT.SECRET, { expiresIn: "1h" });
    const authHeaders = {
      Cookie: `${env.COOKIE.NAME}=${token}`,
      "Content-Type": "application/json",
    };

    // Find a valid sample alert for individual tests
    const sampleAlert = await Alert.findOne({ severity: ALERT_SEVERITY.CRITICAL });
    if (!sampleAlert) throw new Error("No CRITICAL alert found in database. Run Phase 4A ingestion first.");
    const sampleAlertId = sampleAlert.alertId;

    console.log(`\n--- Test Group 1: Authentication Barriers (401 Unauthorized) ---`);
    {
      const resList = await fetch(`${BASE_URL}/alerts`);
      assert(resList.status === 401, "Unauthenticated GET /alerts returns 401");

      const resDetail = await fetch(`${BASE_URL}/alerts/${sampleAlertId}`);
      assert(resDetail.status === 401, "Unauthenticated GET /alerts/:alertId returns 401");

      const resEvidence = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/evidence`);
      assert(resEvidence.status === 401, "Unauthenticated GET /alerts/:alertId/evidence returns 401");

      const resStatus = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACKNOWLEDGED" }),
      });
      assert(resStatus.status === 401, "Unauthenticated PATCH /alerts/:alertId/status returns 401");
    }

    console.log(`\n--- Test Group 2: List Alerts & Pagination ---`);
    {
      const res = await fetch(`${BASE_URL}/alerts`, { headers: authHeaders });
      const json = await res.json();
      assert(res.status === 200, "Authenticated GET /alerts returns 200 OK");
      assert(json.success === true, "Response format contains success: true");
      assert(json.data.alerts.length === 25, "Default page limit returns exactly 25 alerts");
      assert(json.data.pagination.total === 18056, "Total alert count matches 18,056");
      assert(json.data.pagination.page === 1, "Default page is 1");
      assert(json.data.pagination.totalPages === Math.ceil(18056 / 25), "Total pages calculated correctly (723)");

      // Custom pagination
      const resCustom = await fetch(`${BASE_URL}/alerts?page=2&limit=10`, { headers: authHeaders });
      const jsonCustom = await resCustom.json();
      assert(resCustom.status === 200, "Custom page=2&limit=10 returns 200");
      assert(jsonCustom.data.alerts.length === 10, "Returns exactly 10 alerts");
      assert(jsonCustom.data.pagination.page === 2, "Pagination metadata reflects page 2");

      // Maximum limit enforcement
      const resOverLimit = await fetch(`${BASE_URL}/alerts?limit=150`, { headers: authHeaders });
      const jsonOverLimit = await resOverLimit.json();
      assert(resOverLimit.status === 400, "Requesting limit > 100 returns 400 Bad Request");
      assert(jsonOverLimit.success === false, "Error response has success: false");

      // Negative page rejection
      const resNegPage = await fetch(`${BASE_URL}/alerts?page=-1`, { headers: authHeaders });
      assert(resNegPage.status === 400, "Requesting page < 1 returns 400 Bad Request");
    }

    console.log(`\n--- Test Group 3: Filtering (Severity, Status, Department, Dates, Search) ---`);
    {
      // Severity Filter
      const resCrit = await fetch(`${BASE_URL}/alerts?severity=CRITICAL`, { headers: authHeaders });
      const jsonCrit = await resCrit.json();
      assert(resCrit.status === 200, "GET /alerts?severity=CRITICAL returns 200");
      assert(jsonCrit.data.alerts.every((a) => a.severity === "CRITICAL"), "All returned alerts have severity=CRITICAL");
      assert(jsonCrit.data.pagination.total === 4293, "Total CRITICAL alert count is 4,293");

      // Invalid Severity
      const resBadSev = await fetch(`${BASE_URL}/alerts?severity=SUPER_CRITICAL`, { headers: authHeaders });
      assert(resBadSev.status === 400, "Invalid severity parameter returns 400 Bad Request");

      // Status Filter
      const resOpen = await fetch(`${BASE_URL}/alerts?status=OPEN`, { headers: authHeaders });
      const jsonOpen = await resOpen.json();
      assert(resOpen.status === 200, "GET /alerts?status=OPEN returns 200");
      assert(jsonOpen.data.alerts.every((a) => a.status === "OPEN"), "All returned alerts have status=OPEN");

      // Department Filter
      const resDept = await fetch(`${BASE_URL}/alerts?department=${encodeURIComponent(sampleAlert.department)}`, { headers: authHeaders });
      const jsonDept = await resDept.json();
      assert(resDept.status === 200, `GET /alerts?department=${sampleAlert.department} returns 200`);
      assert(jsonDept.data.alerts.every((a) => a.department.toLowerCase() === sampleAlert.department.toLowerCase()), "Department filter matches accurately");

      // Date Range Filter
      const resDate = await fetch(`${BASE_URL}/alerts?from=2010-01-01&to=2010-06-30`, { headers: authHeaders });
      const jsonDate = await resDate.json();
      assert(resDate.status === 200, "GET /alerts?from=...&to=... returns 200");
      assert(
        jsonDate.data.alerts.every((a) => new Date(a.firstSeen) >= new Date("2010-01-01") && new Date(a.firstSeen) <= new Date("2010-06-30")),
        "All alerts strictly within date range"
      );

      // Search Query
      const resSearch = await fetch(`${BASE_URL}/alerts?search=${sampleAlert.userId}`, { headers: authHeaders });
      const jsonSearch = await resSearch.json();
      assert(resSearch.status === 200, `GET /alerts?search=${sampleAlert.userId} returns 200`);
      assert(jsonSearch.data.alerts.length > 0, "Search query returns matching records");
    }

    console.log(`\n--- Test Group 4: Sorting Whitelist & Order ---`);
    {
      const resSortPeak = await fetch(`${BASE_URL}/alerts?sortBy=peakScore&sortOrder=asc`, { headers: authHeaders });
      const jsonSortPeak = await resSortPeak.json();
      assert(resSortPeak.status === 200, "GET /alerts?sortBy=peakScore&sortOrder=asc returns 200");
      const scores = jsonSortPeak.data.alerts.map((a) => a.peakScore);
      let isAsc = true;
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] < scores[i - 1]) isAsc = false;
      }
      assert(isAsc, "Alerts correctly sorted by peakScore ascending");

      // Non-whitelisted sort field rejection
      const resBadSort = await fetch(`${BASE_URL}/alerts?sortBy=unindexedSecretField`, { headers: authHeaders });
      assert(resBadSort.status === 400, "Arbitrary non-whitelisted sortBy parameter rejected with 400");
    }

    console.log(`\n--- Test Group 5: Alert Details Endpoint (GET /alerts/:alertId) ---`);
    {
      const res = await fetch(`${BASE_URL}/alerts/${sampleAlertId}`, { headers: authHeaders });
      const json = await res.json();
      assert(res.status === 200, `GET /alerts/${sampleAlertId} returns 200`);
      assert(json.data.alert.alertId === sampleAlertId, "Returned alert matches requested alertId");
      assert(!!json.data.monitoredIdentity, "Returns associated monitored employee profile");
      assert(json.data.monitoredIdentity.userId === sampleAlert.userId, "MonitoredIdentity userId matches alert userId");
      assert(Array.isArray(json.data.alert.scoreTrajectory), "scoreTrajectory is present as an array");
      assert(typeof json.data.alert.peakScore === "number", "peakScore is a valid number");

      // Nonexistent alert -> 404
      const resNonexistent = await fetch(`${BASE_URL}/alerts/ALT-NONEXISTENT-99999999`, { headers: authHeaders });
      const jsonNonexistent = await resNonexistent.json();
      assert(resNonexistent.status === 404, "GET nonexistent alertId returns 404 Not Found");
      assert(jsonNonexistent.success === false, "404 response has success: false");
    }

    console.log(`\n--- Test Group 6: Alert Evidence Endpoint (GET /alerts/:alertId/evidence) ---`);
    {
      const res = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/evidence`, { headers: authHeaders });
      const json = await res.json();
      assert(res.status === 200, `GET /alerts/${sampleAlertId}/evidence returns 200`);
      assert(Array.isArray(json.data.evidence), "Evidence items returned as array");
      assert(!!json.data.pagination, "Evidence pagination metadata returned");

      // Nonexistent alert evidence -> 404
      const resNonexistent = await fetch(`${BASE_URL}/alerts/ALT-NONEXISTENT-99999999/evidence`, { headers: authHeaders });
      assert(resNonexistent.status === 404, "GET evidence for nonexistent alertId returns 404");
    }

    console.log(`\n--- Test Group 7: Operational Status Transition & Security ---`);
    {
      const originalStatus = sampleAlert.status;

      // 1. Valid Transition: OPEN -> ACKNOWLEDGED
      const resAck = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "ACKNOWLEDGED" }),
      });
      const jsonAck = await resAck.json();
      assert(resAck.status === 200, "PATCH status -> ACKNOWLEDGED returns 200");
      assert(jsonAck.data.status === "ACKNOWLEDGED", "Alert status updated to ACKNOWLEDGED");
      assert(!!jsonAck.data.acknowledgedAt, "acknowledgedAt timestamp recorded");

      // 2. Valid Transition: ACKNOWLEDGED -> INVESTIGATING
      const resInv = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "INVESTIGATING" }),
      });
      assert(resInv.status === 200, "PATCH status -> INVESTIGATING returns 200");

      // 3. Valid Transition: INVESTIGATING -> RESOLVED
      const resRes = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      const jsonRes = await resRes.json();
      assert(resRes.status === 200, "PATCH status -> RESOLVED returns 200");
      assert(!!jsonRes.data.resolvedAt, "resolvedAt timestamp recorded");

      // 4. Invalid Transition: RESOLVED -> OPEN (Forbidden Transition)
      const resInvalidTrans = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "OPEN" }),
      });
      assert(resInvalidTrans.status === 409, "Illegal transition RESOLVED -> OPEN rejected with 409 Conflict");

      // 5. ML Field Tampering Protection
      const resTamper = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          status: "INVESTIGATING",
          peakScore: 50.0,
          severity: "LOW",
          userId: "HACKER",
        }),
      });
      assert(resTamper.status === 400, "Attempting to modify ML fields via status endpoint rejected with 400 Bad Request");

      // 6. Invalid Status String
      const resBadStatus = await fetch(`${BASE_URL}/alerts/${sampleAlertId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "NOT_A_REAL_STATUS" }),
      });
      assert(resBadStatus.status === 400, "Invalid status enum string rejected with 400");

      // Restore alert back to original status
      await Alert.updateOne({ alertId: sampleAlertId }, { $set: { status: originalStatus } });
      console.log(`  [CLEANUP] Restored test alert ${sampleAlertId} back to status '${originalStatus}'`);

      // Clean up test analyst user
      await User.deleteOne({ email: testEmail });
      console.log(`  [CLEANUP] Cleaned up test analyst account`);
    }

    console.log("\n" + "=".repeat(70));
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log("=".repeat(70));

    return failed === 0;
  } finally {
    server.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runTestSuite()
    .then(async (success) => {
      await mongoose.disconnect();
      process.exit(success ? 0 : 1);
    })
    .catch(async (err) => {
      console.error("\nFATAL TEST SUITE ERROR:", err);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      process.exit(1);
    });
}
