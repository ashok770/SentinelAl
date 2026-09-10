import jwt from "jsonwebtoken";
import { env } from "./src/config/env.js";

const BASE_URL = "http://localhost:5000/api/v1/auth";

async function runTests() {
  console.log("🚀 Starting Sprint 3.2 Signup Verification Tests...\n");
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

  const testEmail = `analyst_${Date.now()}@sentinelai.local`;

  // Test 1: Validation - Missing name
  {
    console.log("Test 1: Missing Name");
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "SecurePassword123!" }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("Name is required"), `Expected validation message, got "${data.message}"`);
  }

  // Test 2: Validation - Invalid email
  {
    console.log("\nTest 2: Invalid Email");
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Security Analyst", email: "not-an-email", password: "SecurePassword123!" }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("valid email"), `Expected validation message, got "${data.message}"`);
  }

  // Test 3: Validation - Short password
  {
    console.log("\nTest 3: Short Password (< 8 chars)");
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Security Analyst", email: testEmail, password: "short" }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("at least 8 characters"), `Expected validation message, got "${data.message}"`);
  }

  // Test 4: Successful Signup
  let registeredUser;
  let cookieHeader;
  {
    console.log("\nTest 4: Valid Signup");
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "  Security Analyst One  ",
        email: `  ${testEmail.toUpperCase()}  `,
        password: "SuperSecretPassword123!",
      }),
    });
    const data = await res.json();
    cookieHeader = res.headers.get("set-cookie");

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.message === "User registered successfully", `Expected success message, got "${data.message}"`);
    assert(!!data.data?.user, "Expected user object in data");
    assert(data.data?.user?.email === testEmail.toLowerCase(), `Expected normalized lowercase trimmed email, got ${data.data?.user?.email}`);
    assert(data.data?.user?.name === "Security Analyst One", `Expected trimmed name, got ${data.data?.user?.name}`);
    assert(data.data?.user?.provider === "local", `Expected provider 'local', got ${data.data?.user?.provider}`);
    assert(Array.isArray(data.data?.user?.roles) && data.data?.user?.roles.includes("analyst"), "Expected roles to contain 'analyst'");
    assert(data.data?.user?.passwordHash === undefined, "passwordHash must NOT be returned in response");
    assert(data.data?.token === undefined, "token must NOT be returned in JSON response body");

    registeredUser = data.data?.user;
  }

  // Test 5: Cookie Verification
  {
    console.log("\nTest 5: HTTP-Only Cookie Verification");
    assert(!!cookieHeader, "Set-Cookie header must be present");
    assert(cookieHeader.includes(`${env.COOKIE.NAME}=`), `Cookie name must match configured name (${env.COOKIE.NAME})`);
    assert(cookieHeader.toLowerCase().includes("httponly"), "Cookie must be HttpOnly");
    assert(cookieHeader.toLowerCase().includes("samesite=lax"), "Cookie SameSite must match config (lax)");

    // Extract JWT and verify
    const tokenMatch = cookieHeader.match(new RegExp(`${env.COOKIE.NAME}=([^;]+)`));
    const token = tokenMatch ? tokenMatch[1] : null;
    assert(!!token, "JWT token extracted from cookie");

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT.SECRET);
        assert(decoded.id === registeredUser._id, `JWT decoded id (${decoded.id}) matches user id (${registeredUser._id})`);
        assert(decoded.email === registeredUser.email, `JWT decoded email (${decoded.email}) matches user email (${registeredUser.email})`);
        assert(Array.isArray(decoded.roles) && decoded.roles.includes("analyst"), "JWT decoded roles contain 'analyst'");
      } catch (err) {
        assert(false, `JWT verification failed: ${err.message}`);
      }
    }
  }

  // Test 6: Duplicate Email Rejection (Service level check)
  {
    console.log("\nTest 6: Duplicate Email Conflict (HTTP 409)");
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Another Analyst",
        email: testEmail.toUpperCase(),
        password: "AnotherPassword123!",
      }),
    });
    const data = await res.json();
    assert(res.status === 409, `Expected status 409, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("already exists"), `Expected duplicate message, got "${data.message}"`);
  }

  // Test 7: Race Condition / Concurrent Signup Test
  {
    console.log("\nTest 7: Race Condition / Concurrent Signups with Same Email");
    const raceEmail = `race_${Date.now()}@sentinelai.local`;
    const payload = {
      name: "Concurrent Analyst",
      email: raceEmail,
      password: "Password123!",
    };

    // Fire two requests simultaneously
    const [res1, res2] = await Promise.all([
      fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    assert(
      statuses[0] === 201 && statuses[1] === 409,
      `Expected one 201 and one 409, got [${statuses[0]}, ${statuses[1]}]`,
    );

    const failRes = res1.status === 409 ? res1 : res2;
    const failData = await failRes.json();
    assert(
      failData.message.includes("already exists"),
      `Expected failure message to state account already exists, got "${failData.message}"`,
    );
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
