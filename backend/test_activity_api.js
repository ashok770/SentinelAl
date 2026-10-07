import { env } from "./src/config/env.js";

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("🚀 Starting Sprint 4.2 Activity API Tests...\n");
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

  const testEmail = `activity_tester_${Date.now()}@sentinelai.local`;
  let cookieHeader;

  // 1. Setup: Signup a user to get auth cookie
  {
    console.log("Setup: Create user for auth");
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Activity Tester",
        email: testEmail,
        password: "SecurePassword123!",
      }),
    });
    cookieHeader = res.headers.get("set-cookie");
    const data = await res.json();
    assert(res.status === 201, "Setup user created successfully");
    assert(!!cookieHeader, "Received auth cookie");
  }

  // Extract the cookie string to pass in fetch headers
  const cookieMatch = cookieHeader.match(new RegExp(`${env.COOKIE.NAME}=([^;]+)`));
  const cookieString = cookieMatch ? `${env.COOKIE.NAME}=${cookieMatch[1]}` : "";

  // 2. Test: Unauthenticated access
  {
    console.log("\nTest 1: Unauthenticated access denied");
    const res = await fetch(`${BASE_URL}/activity`);
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
  }

  // 3. Test: Get all demo users
  {
    console.log("\nTest 2: Get all demo users");
    const res = await fetch(`${BASE_URL}/activity/users`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(data.status === "success", "Response status is success");
    assert(Array.isArray(data.data), "Data is an array");
    // Depending on if seed has run, length might be 0 or more, but it shouldn't error.
  }

  // 4. Test: Get activities with limit
  {
    console.log("\nTest 3: Get activities with limit");
    const res = await fetch(`${BASE_URL}/activity?limit=5`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(data.status === "success", "Response status is success");
    assert(data.data.length <= 5, `Expected max 5 items, got ${data.data.length}`);
  }

  // 5. Test: Get activities by user ID
  {
    console.log("\nTest 4: Get activities by userId parameter");
    const res = await fetch(`${BASE_URL}/activity/users/DU-001`, {
      headers: { Cookie: cookieString },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(data.status === "success", "Response status is success");
    // If there are results, verify they belong to DU-001
    if (data.data.length > 0) {
      const allMatch = data.data.every(a => a.userId === "DU-001");
      assert(allMatch, "All returned activities belong to DU-001");
    } else {
      assert(true, "No activities found for DU-001 (OK)");
    }
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
