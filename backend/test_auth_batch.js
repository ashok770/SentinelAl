import jwt from "jsonwebtoken";
import { env } from "./src/config/env.js";
import User from "./src/models/User.js";
import mongoose from "mongoose";

const BASE_URL = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("🚀 Starting Sprint 3.4, 3.5, 3.6 Batch Tests...\n");
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

  // Connect to DB to manipulate a test user if needed
  await mongoose.connect(env.MONGODB_URI);

  const testEmail = `batch_test_${Date.now()}@sentinelai.local`;
  const password = "BatchPassword123!";

  // 0. Setup: Create a user and get a valid cookie/token
  console.log("\nSetup: Registering a test user...");
  let res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Batch Tester", email: testEmail, password }),
  });
  let data = await res.json();
  const validCookie = res.headers.get("set-cookie").split(";")[0]; // extract cookie part
  const tokenMatch = validCookie.match(new RegExp(`${env.COOKIE.NAME}=([^;]+)`));
  const validToken = tokenMatch[1];
  const registeredUser = data.data.user;

  // Test /auth/me
  console.log("\n--- Testing /auth/me ---");

  // 1. No cookie → 401
  res = await fetch(`${BASE_URL}/auth/me`, { method: "GET" });
  assert(res.status === 401, "No cookie -> 401");

  // 2. Invalid token → 401
  res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Cookie": `${env.COOKIE.NAME}=invalid-token-123` }
  });
  assert(res.status === 401, "Invalid cookie token -> 401");

  // 3. Expired token → 401
  const expiredToken = jwt.sign({ id: registeredUser._id }, env.JWT.SECRET, { expiresIn: "-1h" });
  res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Cookie": `${env.COOKIE.NAME}=${expiredToken}` }
  });
  assert(res.status === 401, "Expired cookie token -> 401");

  // 4. Valid signup/login cookie → 200
  res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Cookie": validCookie }
  });
  data = await res.json();
  assert(res.status === 200, "Valid cookie -> 200");

  // 5. Safe user returned & 6. passwordHash absent
  assert(data.success === true, "success is true");
  assert(data.data && data.data.user, "Safe user returned");
  assert(data.data.user.email === testEmail, "Email matches");
  assert(data.data.user.passwordHash === undefined, "passwordHash is absent");
  
  // 7. JWT absent from JSON
  assert(data.data.token === undefined, "JWT is absent from JSON");

  // 8. Inactive user rejected
  await User.findByIdAndUpdate(registeredUser._id, { isActive: false });
  res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Cookie": validCookie }
  });
  assert(res.status === 401, "Inactive user -> 401");
  await User.findByIdAndUpdate(registeredUser._id, { isActive: true }); // restore

  // Bearer fallback:
  console.log("\n--- Testing Bearer Fallback ---");

  // 9. Valid Bearer token → 200
  res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${validToken}` }
  });
  assert(res.status === 200, "Valid Bearer token -> 200");

  // 10. Invalid Bearer token → 401
  res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Authorization": "Bearer invalid-bearer-123" }
  });
  assert(res.status === 401, "Invalid Bearer token -> 401");

  // Protected investigations:
  console.log("\n--- Testing Protected Investigations ---");

  // 11. GET /investigations without auth → 401
  res = await fetch(`${BASE_URL}/investigations`, { method: "GET" });
  assert(res.status === 401, "GET /investigations without auth -> 401");

  // 12. GET /investigations with valid cookie → existing successful behavior
  res = await fetch(`${BASE_URL}/investigations`, {
    method: "GET",
    headers: { "Cookie": validCookie }
  });
  assert(res.status === 200, "GET /investigations with valid auth -> 200");

  const dummyId = new mongoose.Types.ObjectId().toString();

  // 13. GET investigation by ID without auth → 401
  res = await fetch(`${BASE_URL}/investigations/${dummyId}`, { method: "GET" });
  assert(res.status === 401, "GET /investigations/:id without auth -> 401");

  // 14. GET investigation by ID with valid auth → successful behavior (404 since it's dummy)
  res = await fetch(`${BASE_URL}/investigations/${dummyId}`, {
    method: "GET",
    headers: { "Cookie": validCookie }
  });
  assert(res.status !== 401, "GET /investigations/:id with valid auth -> expected non-401 (e.g. 404)");

  // 15. POST investigation without auth → 401
  res = await fetch(`${BASE_URL}/investigations`, { method: "POST" });
  assert(res.status === 401, "POST /investigations without auth -> 401");

  // 16. POST investigation with valid auth → existing behavior (validation error -> 400)
  res = await fetch(`${BASE_URL}/investigations`, {
    method: "POST",
    headers: { "Cookie": validCookie, "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  assert(res.status !== 401, "POST /investigations with valid auth -> expected non-401 (e.g. 400)");

  // 17. POST evidence without auth → 401
  res = await fetch(`${BASE_URL}/investigations/${dummyId}/evidence`, { method: "POST" });
  assert(res.status === 401, "POST /investigations/:id/evidence without auth -> 401");

  // 18. POST evidence with valid auth → existing behavior (400 validation error)
  res = await fetch(`${BASE_URL}/investigations/${dummyId}/evidence`, {
    method: "POST",
    headers: { "Cookie": validCookie, "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  assert(res.status !== 401, "POST /investigations/:id/evidence with valid auth -> expected non-401");

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  await mongoose.disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
