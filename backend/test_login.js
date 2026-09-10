import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import User from "./src/models/User.js";

const BASE_URL = "http://localhost:5000/api/v1/auth";
const INVESTIGATION_URL = "http://localhost:5000/api/v1/investigations";

async function runTests() {
  console.log("🚀 Starting Sprint 3.3 Login Verification Tests...\n");
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

  const testEmail = `login_analyst_${Date.now()}@sentinelai.local`;
  const testPassword = "ValidPassword123!";
  const testName = "Login Test Analyst";

  // First, create the user via signup endpoint
  console.log("--- Setup: Registering user for login tests ---");
  const signupRes = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });
  assert(signupRes.status === 201, "Setup user created successfully with 201");
  const signupData = await signupRes.json();
  const userId = signupData.data?.user?._id;
  assert(!!userId, "Retrieved user ID from signup");

  // Test 1: Validation - Missing email
  {
    console.log("\nTest 1: Validation - Missing Email (HTTP 400)");
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: testPassword }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("valid email"), `Expected validation message, got "${data.message}"`);
  }

  // Test 2: Validation - Malformed email
  {
    console.log("\nTest 2: Validation - Malformed Email (HTTP 400)");
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-string", password: testPassword }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("valid email"), `Expected validation message, got "${data.message}"`);
  }

  // Test 3: Validation - Missing password
  {
    console.log("\nTest 3: Validation - Missing Password (HTTP 400)");
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.includes("Password is required"), `Expected validation message, got "${data.message}"`);
  }

  // Test 4: Unknown email
  {
    console.log("\nTest 4: Unknown Email (HTTP 401)");
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent_user@sentinelai.local", password: testPassword }),
    });
    const data = await res.json();
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message === "Invalid email or password", `Expected generic message, got "${data.message}"`);
  }

  // Test 5: Wrong password
  {
    console.log("\nTest 5: Wrong Password (HTTP 401)");
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "IncorrectPassword999!" }),
    });
    const data = await res.json();
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message === "Invalid email or password", `Expected generic message, got "${data.message}"`);
  }

  // Test 6: Valid Login
  let loggedInUser;
  let cookieHeader;
  {
    console.log("\nTest 6: Valid Login (HTTP 200)");
    // Test case-insensitivity and trimming
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `  ${testEmail.toUpperCase()}  `,
        password: testPassword,
      }),
    });
    const data = await res.json();
    cookieHeader = res.headers.get("set-cookie");

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.message === "Login successful", `Expected 'Login successful', got "${data.message}"`);
    assert(!!data.data?.user, "Expected user object in data");
    assert(data.data?.user?._id === userId, `Expected matching user ID, got ${data.data?.user?._id}`);
    assert(data.data?.user?.email === testEmail.toLowerCase(), `Expected normalized email, got ${data.data?.user?.email}`);
    assert(data.data?.user?.name === testName, `Expected matching name, got ${data.data?.user?.name}`);
    assert(data.data?.user?.passwordHash === undefined, "passwordHash must NOT be returned");
    assert(data.data?.token === undefined, "token must NOT be returned in response body");
    assert(!!data.data?.user?.lastLoginAt, "lastLoginAt must be populated after successful login");

    loggedInUser = data.data?.user;
  }

  // Test 7: Cookie Verification
  {
    console.log("\nTest 7: HTTP-Only Cookie Verification");
    assert(!!cookieHeader, "Set-Cookie header must be present");
    assert(cookieHeader.includes(`${env.COOKIE.NAME}=`), `Cookie name must match configured name (${env.COOKIE.NAME})`);
    assert(cookieHeader.toLowerCase().includes("httponly"), "Cookie must be HttpOnly");
    assert(cookieHeader.toLowerCase().includes("samesite=lax"), "Cookie SameSite must match config (lax)");

    const tokenMatch = cookieHeader.match(new RegExp(`${env.COOKIE.NAME}=([^;]+)`));
    const token = tokenMatch ? tokenMatch[1] : null;
    assert(!!token, "JWT token extracted from cookie");

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT.SECRET);
        assert(decoded.id === loggedInUser._id, `JWT decoded id (${decoded.id}) matches user id (${loggedInUser._id})`);
        assert(decoded.email === loggedInUser.email, `JWT decoded email (${decoded.email}) matches user email (${loggedInUser.email})`);
        assert(Array.isArray(decoded.roles) && decoded.roles.includes("analyst"), "JWT decoded roles contain 'analyst'");
      } catch (err) {
        assert(false, `JWT verification failed: ${err.message}`);
      }
    }
  }

  // Test 8: lastLoginAt Updates on Success and NOT on Failure
  {
    console.log("\nTest 8: lastLoginAt Tracking Verification");
    const previousLoginAt = new Date(loggedInUser.lastLoginAt).getTime();

    // Small delay to ensure timestamp difference if updated
    await new Promise((r) => setTimeout(r, 50));

    // Attempt failed login
    await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "WrongPassword!" }),
    });

    // Check DB directly: lastLoginAt should NOT have changed
    await mongoose.connect(env.MONGODB_URI);
    const userDocAfterFail = await User.findById(userId);
    const failTimestamp = new Date(userDocAfterFail.lastLoginAt).getTime();
    assert(
      failTimestamp === previousLoginAt,
      `lastLoginAt must NOT change after failed login (${failTimestamp} === ${previousLoginAt})`,
    );

    // Wait slightly and perform successful login
    await new Promise((r) => setTimeout(r, 50));
    const successRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const successData = await successRes.json();
    const newLoginAt = new Date(successData.data?.user?.lastLoginAt).getTime();
    assert(
      newLoginAt > previousLoginAt,
      `lastLoginAt must update on subsequent successful login (${newLoginAt} > ${previousLoginAt})`,
    );
  }

  // Test 9: Inactive User Rejection
  {
    console.log("\nTest 9: Inactive Account Rejection");
    // Set user to inactive in database
    await User.findByIdAndUpdate(userId, { isActive: false });

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const data = await res.json();

    assert(res.status >= 400 && res.status < 500, `Expected 4xx client rejection, got ${res.status}`);
    assert(data.success === false, "Expected success: false");
    assert(data.message.toLowerCase().includes("inactive"), `Expected message indicating inactive status, got "${data.message}"`);
  }

  // Test 10: Investigation Regression Test
  {
    console.log("\nTest 10: Investigation Regression Test");
    const invRes = await fetch(INVESTIGATION_URL);
    const invData = await invRes.json();
    assert(invRes.status === 200, `Expected status 200 for investigations, got ${invRes.status}`);
    assert(invData.success === true, "Expected success: true for investigations");
    assert(Array.isArray(invData.data?.investigations), "Expected investigations array");
  }

  await mongoose.disconnect();

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
