import { env } from "./src/config/env.js";
import RiskScoringService from "./src/services/RiskScoringService.js";

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("🚀 Starting Sprint 4.4 Risk Scoring API Tests...\n");
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

  const testEmail = `risk_tester_${Date.now()}@sentinelai.local`;
  let cookieHeader;

  // 1. Setup: Signup a user to get auth cookie
  {
    console.log("Setup: Create user for auth");
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Risk Tester",
        email: testEmail,
        password: "SecurePassword123!",
      }),
    });
    cookieHeader = res.headers.get("set-cookie");
    assert(res.status === 201, "Setup user created successfully");
  }

  const cookieMatch = cookieHeader.match(new RegExp(`${env.COOKIE.NAME}=([^;]+)`));
  const cookieString = cookieMatch ? `${env.COOKIE.NAME}=${cookieMatch[1]}` : "";

  // 2. Test: Unauthenticated access
  {
    console.log("\nTest 1: Unauthenticated risk endpoint");
    const res = await fetch(`${BASE_URL}/risk`);
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
  }

  // 3. Test: Valid user with no abnormal signals (DU-001)
  {
    console.log("\nTest 2: Valid user with no abnormal signals (DU-001)");
    const res = await fetch(`${BASE_URL}/risk/users/DU-001`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const risk = data.data;
    assert(risk.riskScore === 0, "Score is 0");
    assert(risk.severity === "LOW", "Severity is LOW");
    assert(risk.contributingSignals.length === 0, "No contributing signals");
  }

  // 4. Test: Combined signals via integration (DU-003)
  {
    console.log("\nTest 3: Combined signals (DU-003) - Unusual login + New Device + File Download");
    const res = await fetch(`${BASE_URL}/risk/users/DU-003`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const risk = data.data;
    assert(risk.riskScore === 75, `Expected score 75, got ${risk.riskScore}`);
    assert(risk.severity === "CRITICAL", `Expected severity CRITICAL, got ${risk.severity}`);
    assert(risk.contributingSignals.length === 4, `Has 4 contributing signals, got ${risk.contributingSignals.length}`);
  }
  
  // 5. Test: Unknown user -> 404
  {
    console.log("\nTest 4: Unknown user handling");
    const res = await fetch(`${BASE_URL}/risk/users/DU-999`, {
      headers: { Cookie: cookieString },
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  }

  // 6. Test: Deterministic repeated calls
  {
    console.log("\nTest 5: Deterministic repeated calls");
    const res1 = await fetch(`${BASE_URL}/risk/users/DU-003`, { headers: { Cookie: cookieString } });
    const res2 = await fetch(`${BASE_URL}/risk/users/DU-003`, { headers: { Cookie: cookieString } });
    const data1 = await res1.json();
    const data2 = await res2.json();
    assert(data1.data.riskScore === data2.data.riskScore, "Scores match exactly");
    assert(data1.data.analyzedEventCount === data2.data.analyzedEventCount, "Event counts match exactly");
  }

  // 7. Test: Isolated Service Logic (Unit Tests for scoring bounds and combinations)
  console.log("\n--- Service Logic Unit Tests ---");

  const mockAnalysis = (signals) => ({
    userId: "MOCK",
    analysisWindow: { start: "start", end: "end" },
    analyzedEventCount: 1,
    signals
  });

  {
    console.log("\nTest 6: Unusual login only");
    const r = RiskScoringService.calculateRisk(mockAnalysis({ unusualLoginTime: true }));
    assert(r.riskScore === 20, "Score is 20");
    assert(r.severity === "LOW", "Severity is LOW");
  }

  {
    console.log("\nTest 7: New device only");
    const r = RiskScoringService.calculateRisk(mockAnalysis({ newDevice: true }));
    assert(r.riskScore === 20, "Score is 20");
    assert(r.severity === "LOW", "Severity is LOW");
  }

  {
    console.log("\nTest 8: Abnormal file access only");
    const r = RiskScoringService.calculateRisk(mockAnalysis({ abnormalFileAccess: true }));
    assert(r.riskScore === 25, "Score is 25");
    assert(r.severity === "MEDIUM", "Severity is MEDIUM");
  }

  {
    console.log("\nTest 9: Abnormal data transfer only");
    const r = RiskScoringService.calculateRisk(mockAnalysis({ abnormalDataTransfer: true }));
    assert(r.riskScore === 25, "Score is 25");
    assert(r.severity === "MEDIUM", "Severity is MEDIUM");
  }

  {
    console.log("\nTest 10: Sensitive resource only");
    const r = RiskScoringService.calculateRisk(mockAnalysis({ sensitiveResourceAccess: true }));
    assert(r.riskScore === 10, "Score is 10");
    assert(r.severity === "LOW", "Severity is LOW");
  }

  {
    console.log("\nTest 11: Maximum possible combination and Clamping");
    const allSignals = {
      unusualLoginTime: true, // 20
      newDevice: true, // 20
      abnormalFileAccess: true, // 25
      abnormalDataTransfer: true, // 25
      sensitiveResourceAccess: true // 10
      // Sum = 100
    };
    const r = RiskScoringService.calculateRisk(mockAnalysis(allSignals));
    assert(r.riskScore === 100, "Score is 100 (Max)");
    assert(r.severity === "CRITICAL", "Severity is CRITICAL");
  }

  {
    console.log("\nTest 12: Severity boundary tests");
    assert(RiskScoringService.getSeverity(24) === "LOW", "24 is LOW");
    assert(RiskScoringService.getSeverity(25) === "MEDIUM", "25 is MEDIUM");
    assert(RiskScoringService.getSeverity(49) === "MEDIUM", "49 is MEDIUM");
    assert(RiskScoringService.getSeverity(50) === "HIGH", "50 is HIGH");
    assert(RiskScoringService.getSeverity(74) === "HIGH", "74 is HIGH");
    assert(RiskScoringService.getSeverity(75) === "CRITICAL", "75 is CRITICAL");
    assert(RiskScoringService.getSeverity(100) === "CRITICAL", "100 is CRITICAL");
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
