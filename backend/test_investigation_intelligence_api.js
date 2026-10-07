import { env } from "./src/config/env.js";

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("🚀 Starting Sprint 4.6 Investigation Intelligence API Tests...\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  const testEmail = `investigation_tester_${Date.now()}@sentinelai.local`;
  let cookieHeader;

  // 1. Setup: Signup a user to get auth cookie
  {
    console.log("Setup: Create user for auth");
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Intelligence Tester",
        email: testEmail,
        password: "SecurePassword123!",
      }),
    });
    cookieHeader = res.headers.get("set-cookie");
    assert(res.status === 201, "Setup user created successfully");
  }

  const cookieMatch = cookieHeader.match(new RegExp(`${env.COOKIE.NAME}=([^;]+)`));
  const cookieString = cookieMatch ? `${env.COOKIE.NAME}=${cookieMatch[1]}` : "";

  const fetchOptions = { headers: { Cookie: cookieString } };
  const postOptions = (body) => ({
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieString },
    body: JSON.stringify(body)
  });

  // Ensure an alert exists for DU-003
  let alertId;
  {
    console.log("\nSetup: Generate Alert for DU-003");
    const res = await fetch(`${BASE_URL}/alerts/evaluate`, postOptions({ userId: "DU-003" }));
    const data = await res.json();
    assert(res.status === 200, "Evaluated DU-003");
    
    // Whether it was created or existing, we get the alert back
    if (data.data.alert) {
      alertId = data.data.alert.alertId;
    }
    assert(!!alertId, `Alert ID obtained: ${alertId}`);
  }

  // Test: Unauthenticated
  {
    console.log("\nTest 1: Unauthenticated GET /investigations/alerts/:alertId/context");
    assert((await fetch(`${BASE_URL}/investigations/alerts/${alertId}/context`)).status === 401, "GET context -> 401");
  }

  // Test: Unknown alert
  {
    console.log("\nTest 2: Unknown alert handling");
    const res = await fetch(`${BASE_URL}/investigations/alerts/ALT-UNKNOWN/context`, fetchOptions);
    assert(res.status === 404, "Unknown alert returns 404");
  }

  // Test: Valid context retrieval
  {
    console.log("\nTest 3: Valid alert context retrieval");
    const res = await fetch(`${BASE_URL}/investigations/alerts/${alertId}/context`, fetchOptions);
    const data = await res.json();
    
    assert(res.status === 200, "Successfully fetched context");
    
    const context = data.data;
    assert(!!context.alert, "Contains alert object");
    assert(!!context.user, "Contains user object");
    assert(!!context.riskAssessment, "Contains riskAssessment object");
    assert(!!context.behavioralAnalysis, "Contains behavioralAnalysis object");
    assert(Array.isArray(context.timeline), "Contains timeline array");
    assert(Array.isArray(context.evidence), "Contains evidence array");

    assert(context.user.userId === "DU-003", "Correct user context returned");
    assert(context.user.passwordHash === undefined, "User passwordHash is not exposed");

    assert(context.riskAssessment.riskScore === 75, "Correct risk score returned");
    assert(context.riskAssessment.severity === "CRITICAL", "Correct severity returned");
    assert(context.riskAssessment.contributingSignals.length === 4, "Correct contributing signals returned");
    assert(!!context.riskAssessment.analysisStart && !!context.riskAssessment.analysisEnd, "Correct analysis window returned");

    assert(!!context.behavioralAnalysis.baseline.knownDevices, "Behavioral baseline returned");

    assert(context.evidence.length === 4, "Evidence summary matches actual active signals");
    assert(context.evidence.every(e => e.observed === true), "Evidence nodes show observed=true");

    const timeline = context.timeline;
    assert(timeline.length > 0, "Timeline has events");
    assert(timeline.every(t => t.scenario === undefined), "Scenario field is not exposed in timeline");

    // Chronological check
    const sorted = [...timeline].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const isSorted = JSON.stringify(timeline) === JSON.stringify(sorted);
    assert(isSorted, "Timeline is chronologically ordered");

    // Annotation check
    const hasAnnotations = timeline.some(t => t.annotations.length > 0);
    assert(hasAnnotations, "Some events are successfully annotated with signals");
  }

  // Test: Deterministic behavior (repeated call)
  {
    console.log("\nTest 4: Deterministic repeated calls");
    const res1 = await fetch(`${BASE_URL}/investigations/alerts/${alertId}/context`, fetchOptions);
    const data1 = await res1.json();
    
    const res2 = await fetch(`${BASE_URL}/investigations/alerts/${alertId}/context`, fetchOptions);
    const data2 = await res2.json();

    assert(JSON.stringify(data1) === JSON.stringify(data2), "Repeated calls return deterministic results");
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
