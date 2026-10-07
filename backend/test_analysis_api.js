import { env } from "./src/config/env.js";

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("🚀 Starting Sprint 4.3 Behavioral Analysis API Tests...\n");
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

  const testEmail = `analysis_tester_${Date.now()}@sentinelai.local`;
  let cookieHeader;

  // 1. Setup: Signup a user to get auth cookie
  {
    console.log("Setup: Create user for auth");
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Analysis Tester",
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
    console.log("\nTest 1: Unauthenticated access denied");
    const res = await fetch(`${BASE_URL}/analysis`);
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
  }

  // 3. Test: Get all users analysis
  {
    console.log("\nTest 2: Get all users analysis");
    const res = await fetch(`${BASE_URL}/analysis`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(data.status === "success", "Response status is success");
    assert(Array.isArray(data.data), "Data is an array");
    assert(data.data.length === 10, "Expected 10 demo users analyzed");
  }

  // 4. Test: Normal user (Alice - DU-001)
  {
    console.log("\nTest 3: Normal User Analysis (DU-001)");
    const res = await fetch(`${BASE_URL}/analysis/users/DU-001`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const analysis = data.data;
    assert(analysis.userId === "DU-001", "Returned correct userId");
    assert(analysis.baseline.knownDevices.includes("MAC-101"), "Baseline includes known device");
    
    // Alice has normal_activity, so all signals should be false
    assert(analysis.signals.unusualLoginTime === false, "unusualLoginTime is false");
    assert(analysis.signals.newDevice === false, "newDevice is false");
    assert(analysis.signals.abnormalFileAccess === false, "abnormalFileAccess is false");
    assert(analysis.signals.abnormalDataTransfer === false, "abnormalDataTransfer is false");
    assert(analysis.signals.sensitiveResourceAccess === false, "sensitiveResourceAccess is false");
  }

  // 5. Test: Suspicious User (Charlie - DU-003) - Unusual login & New Device
  {
    console.log("\nTest 4: Suspicious User Analysis (DU-003 - combined_insider_behavior)");
    const res = await fetch(`${BASE_URL}/analysis/users/DU-003`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const analysis = data.data;
    assert(analysis.signals.unusualLoginTime === true, "unusualLoginTime is true");
    assert(analysis.signals.newDevice === true, "newDevice is true");
  }

  // 6. Test: Suspicious User (Frank - DU-006) - Abnormal file access (Sensitive Resource)
  {
    console.log("\nTest 5: Suspicious User Analysis (DU-006 - abnormal_file_access)");
    const res = await fetch(`${BASE_URL}/analysis/users/DU-006`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const analysis = data.data;
    assert(analysis.signals.sensitiveResourceAccess === true, "sensitiveResourceAccess is true");
  }

  // 7. Test: Suspicious User (Grace - DU-007) - Abnormal data transfer
  {
    console.log("\nTest 6: Suspicious User Analysis (DU-007 - abnormal_data_transfer)");
    const res = await fetch(`${BASE_URL}/analysis/users/DU-007`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const analysis = data.data;
    assert(analysis.signals.abnormalDataTransfer === true, "abnormalDataTransfer is true");
  }

  // 8. Test: Unknown user handling
  {
    console.log("\nTest 7: Unknown user handling");
    const res = await fetch(`${BASE_URL}/analysis/users/DU-999`, {
      headers: { Cookie: cookieString },
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
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
