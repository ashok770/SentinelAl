import assert from "assert";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { env } from "./src/config/env.js";
import {
  generateOAuthState,
  generateGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  processGoogleLogin
} from "./src/services/google-oauth.service.js";

// Mock fetch
const originalFetch = global.fetch;

async function runTests() {
  console.log("Starting Google OAuth Tests...");

  await mongoose.connect(env.MONGODB_URI);
  await User.deleteMany({});

  try {
    // Test 1: State Generation
    const state = generateOAuthState();
    assert.strictEqual(typeof state, "string");
    assert.ok(state.length > 0);
    console.log("✅ State generation passed");

    // Test 2: URL Generation
    const url = generateGoogleAuthUrl(state);
    assert.ok(url.includes("accounts.google.com"));
    assert.ok(url.includes(`state=${state}`));
    assert.ok(url.includes("openid"));
    console.log("✅ URL generation passed");

    // Mock fetch for successful code exchange and user info
    global.fetch = async (url) => {
      if (url.includes("oauth2.googleapis.com/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "mock_access_token" })
        };
      }
      if (url.includes("openidconnect.googleapis.com/v1/userinfo")) {
        return {
          ok: true,
          json: async () => ({
            sub: "google123",
            email: "test@google.com",
            email_verified: true,
            name: "Test User",
            picture: "http://example.com/pic.jpg"
          })
        };
      }
    };

    // Test 3: Exchange code
    const token = await exchangeGoogleCode("mock_code");
    assert.strictEqual(token, "mock_access_token");
    console.log("✅ Code exchange passed");

    // Test 4: Get user info
    const userInfo = await getGoogleUserInfo("mock_access_token");
    assert.strictEqual(userInfo.sub, "google123");
    console.log("✅ Get user info passed");

    // Test 5: Process login (New Google User)
    const result1 = await processGoogleLogin(userInfo);
    assert.strictEqual(result1.user.email, "test@google.com");
    assert.strictEqual(result1.user.provider, "google");
    assert.ok(result1.token);
    
    const dbUser1 = await User.findOne({ email: "test@google.com" });
    assert.strictEqual(dbUser1.googleId, "google123");
    console.log("✅ New Google user creation passed");

    // Test 6: Process login (Existing Google User)
    const result2 = await processGoogleLogin(userInfo);
    assert.strictEqual(result2.user.email, "test@google.com");
    console.log("✅ Existing Google user login passed");

    // Test 7: Local User Conflict
    await User.deleteMany({});
    const localUser = new User({
      email: "conflict@test.com",
      provider: "local",
      name: "Local User"
    });
    await localUser.save();

    const conflictUserInfo = {
      sub: "google999",
      email: "conflict@test.com",
      email_verified: true,
      name: "Google User",
      picture: "url"
    };

    try {
      await processGoogleLogin(conflictUserInfo);
      assert.fail("Should have thrown conflict error");
    } catch (err) {
      assert.strictEqual(err.isConflict, true);
    }
    console.log("✅ Local account conflict rejection passed");

    // Test 8: Unverified Email Rejection
    const unverifiedUserInfo = {
      sub: "google888",
      email: "unverified@test.com",
      email_verified: false
    };

    try {
      await processGoogleLogin(unverifiedUserInfo);
      assert.fail("Should have thrown unverified error");
    } catch (err) {
      assert.strictEqual(err.message, "Google account is not verified or missing email");
    }
    console.log("✅ Unverified email rejection passed");

  } finally {
    global.fetch = originalFetch;
    await mongoose.disconnect();
  }
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
