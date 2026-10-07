/**
 * SentinelAI — Phase 4C Dashboard & Overview REST API Test Suite
 * ===============================================================
 * Validates:
 * - Authentication enforcement (HTTP 401)
 * - Full summary payload contract (totals, severity, status, trend, departments, priority queue)
 * - Exact count and percentage consistency against MongoDB
 * - Individual sub-endpoints
 * - Real-time execution performance
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function runTestSuite() {
  console.log("=".repeat(70));
  console.log("SENTINELAI — DASHBOARD OVERVIEW REST API TEST SUITE");
  console.log("=".repeat(70));

  // 1. Connect MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // 2. Start ephemeral HTTP server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const BASE_URL = `http://localhost:${port}/api/v1`;

  console.log(`Ephemeral test server running on port ${port}`);

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

  // 3. Setup test user and auth token
  const testUserEmail = `dash_analyst_${Date.now()}@sentinelai.local`;
  const testUser = await User.create({
    name: "Dashboard Test Analyst",
    email: testUserEmail,
    passwordHash: "$2b$10$abcdefghijklmnopqrstuv",
    role: "analyst",
    isActive: true,
  });

  const authToken = jwt.sign(
    {
      id: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role,
    },
    env.JWT.SECRET,
    { expiresIn: "1h" }
  );

  const authHeaders = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  try {
    // -------------------------------------------------------------
    // Test 1: Unauthenticated request rejection
    // -------------------------------------------------------------
    console.log("\n--- Test Suite 1: Authentication Guard ---");
    const unauthRes = await fetch(`${BASE_URL}/dashboard/summary`);
    assert(
      unauthRes.status === 401,
      "GET /api/v1/dashboard/summary requires authentication (HTTP 401)",
      `Got status ${unauthRes.status}`
    );

    // -------------------------------------------------------------
    // Test 2: Authenticated Summary Endpoint
    // -------------------------------------------------------------
    console.log("\n--- Test Suite 2: GET /api/v1/dashboard/summary ---");
    const startTime = Date.now();
    const summaryRes = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: authHeaders,
    });
    const duration = Date.now() - startTime;
    const summaryJson = await summaryRes.json();

    assert(
      summaryRes.status === 200,
      `Summary endpoint returns HTTP 200 (took ${duration}ms)`,
      `Got ${summaryRes.status}`
    );
    assert(
      summaryJson.success === true,
      "Response envelope has success: true",
      JSON.stringify(summaryJson)
    );

    const { totals, severityDistribution, statusDistribution, alertTrend, topDepartments, priorityQueue } =
      summaryJson.data;

    // Verify Totals
    const realTotalAlerts = await Alert.countDocuments();
    assert(
      totals.alerts === realTotalAlerts,
      `totals.alerts (${totals.alerts}) matches MongoDB count (${realTotalAlerts})`
    );
    assert(
      totals.critical === 4293,
      `totals.critical (${totals.critical}) matches calibrated critical threshold (4,293)`
    );
    assert(
      totals.openInvestigations === 18056,
      `totals.openInvestigations (${totals.openInvestigations}) matches open triage alerts (18,056)`
    );
    assert(
      totals.highRiskIdentities === 368,
      `totals.highRiskIdentities (${totals.highRiskIdentities}) matches high/critical identity count (368)`
    );

    // Verify Severity Distribution
    assert(
      Array.isArray(severityDistribution) && severityDistribution.length === 3,
      "severityDistribution contains 3 calibrated tiers (CRITICAL, HIGH, ELEVATED)"
    );
    const criticalItem = severityDistribution.find((s) => s.severity === "CRITICAL");
    const highItem = severityDistribution.find((s) => s.severity === "HIGH");
    const elevatedItem = severityDistribution.find((s) => s.severity === "ELEVATED");

    assert(
      criticalItem && criticalItem.count === 4293 && criticalItem.percentage === 23.78,
      `CRITICAL severity count=4293, percentage=23.78% (got count=${criticalItem?.count}, %=${criticalItem?.percentage})`
    );
    assert(
      highItem && highItem.count === 6554 && highItem.percentage === 36.3,
      `HIGH severity count=6554, percentage=36.30% (got count=${highItem?.count}, %=${highItem?.percentage})`
    );
    assert(
      elevatedItem && elevatedItem.count === 7209 && elevatedItem.percentage === 39.93,
      `ELEVATED severity count=7209, percentage=39.93% (got count=${elevatedItem?.count}, %=${elevatedItem?.percentage})`
    );

    // Verify Status Distribution
    assert(
      Array.isArray(statusDistribution) && statusDistribution.length === 5,
      "statusDistribution contains 5 canonical lifecycle statuses"
    );
    const openStatus = statusDistribution.find((s) => s.status === "OPEN");
    assert(
      openStatus && openStatus.count === 18056,
      `OPEN status count is 18,056 (got ${openStatus?.count})`
    );

    // Verify Alert Trend
    assert(
      Array.isArray(alertTrend) && alertTrend.length === 17,
      `alertTrend contains 17 monthly intervals from 2010-01 to 2011-05 (got ${alertTrend.length})`
    );
    assert(
      alertTrend[0].date === "2010-01" && alertTrend[alertTrend.length - 1].date === "2011-05",
      `alertTrend spans correctly from ${alertTrend[0]?.date} to ${alertTrend[alertTrend.length - 1]?.date}`
    );

    // Verify Top Departments
    assert(
      Array.isArray(topDepartments) && topDepartments.length === 5,
      `topDepartments returns top 5 units (got ${topDepartments.length})`
    );
    assert(
      topDepartments[0].department === "3 - Assembly" && topDepartments[0].count === 2743,
      `Top department is "3 - Assembly" with 2,743 alerts (got ${topDepartments[0]?.department}, ${topDepartments[0]?.count})`
    );

    // Verify Priority Investigation Queue
    assert(
      Array.isArray(priorityQueue) && priorityQueue.length === 6,
      `priorityQueue returns 6 high-priority alerts (got ${priorityQueue.length})`
    );
    const topAlert = priorityQueue[0];
    assert(
      topAlert.alertId && topAlert.employeeName && topAlert.severity && topAlert.peakScore !== undefined,
      "priorityQueue elements contain required fields (alertId, employeeName, severity, peakScore)"
    );

    // -------------------------------------------------------------
    // Test 3: Sub-endpoints
    // -------------------------------------------------------------
    console.log("\n--- Test Suite 3: Sub-endpoints ---");
    const endpoints = [
      "/dashboard/severity-distribution",
      "/dashboard/trend",
      "/dashboard/top-departments",
      "/dashboard/priority-queue",
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`, { headers: authHeaders });
      const json = await res.json();
      assert(
        res.status === 200 && json.success === true,
        `GET /api/v1${ep} returns HTTP 200 with valid envelope`
      );
    }
  } finally {
    // Cleanup
    await User.deleteOne({ _id: testUser._id });
    server.close();
    await mongoose.disconnect();
  }

  console.log("\n" + "=".repeat(70));
  console.log(`DASHBOARD TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("=".repeat(70));

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
