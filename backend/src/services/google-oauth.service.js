import crypto from "crypto";
import { env } from "../config/env.js";
import { generateAuthToken, toSafeUser } from "./auth.service.js";
import {
  findUserByEmail,
  findUserByGoogleId,
  saveUser,
  createUser,
} from "../repositories/user.repository.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Generates a random cryptographic state for OAuth.
 * @returns {string}
 */
export const generateOAuthState = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generates the Google OAuth authorization URL.
 * @param {string} state
 * @returns {string}
 */
export const generateGoogleAuthUrl = (state) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: env.GOOGLE.CALLBACK_URL,
    client_id: env.GOOGLE.CLIENT_ID,
    access_type: "online",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ].join(" "),
    state,
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

/**
 * Exchanges an authorization code for an access token.
 * @param {string} code
 * @returns {Promise<string>}
 */
export const exchangeGoogleCode = async (code) => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: env.GOOGLE.CLIENT_ID,
    client_secret: env.GOOGLE.CLIENT_SECRET,
    redirect_uri: env.GOOGLE.CALLBACK_URL,
    grant_type: "authorization_code",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google code");
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Fetches user profile from Google.
 * @param {string} accessToken
 * @returns {Promise<Object>}
 */
export const getGoogleUserInfo = async (accessToken) => {
  const url = "https://openidconnect.googleapis.com/v1/userinfo";
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return response.json();
};

/**
 * Processes Google user info to find or create a user.
 * @param {Object} googleUser
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const processGoogleLogin = async (googleUser) => {
  const { sub: googleId, email, email_verified, name, picture } = googleUser;

  if (!googleId || !email || !email_verified) {
    throw new UnauthorizedError("Google account is not verified or missing email");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try to find user by Google ID
  let user = await findUserByGoogleId(googleId);

  if (user) {
    if (!user.isActive) {
      throw new UnauthorizedError("Account is inactive");
    }
    user.lastLoginAt = new Date();
    await saveUser(user);
    return { user: toSafeUser(user), token: generateAuthToken(user) };
  }

  // 2. Fallback: try to find user by Email
  user = await findUserByEmail(normalizedEmail);

  if (user) {
    // Conflict resolution: Local account exists with same email
    if (user.provider === "local") {
      const error = new Error("google_account_requires_existing_login");
      error.isConflict = true;
      throw error;
    }

    // Is a Google account without googleId
    if (!user.isActive) {
      throw new UnauthorizedError("Account is inactive");
    }
    user.googleId = googleId;
    user.lastLoginAt = new Date();
    if (!user.avatarUrl) user.avatarUrl = picture;
    await saveUser(user);
    return { user: toSafeUser(user), token: generateAuthToken(user) };
  }

  // 3. Create new Google user
  user = await createUser({
    provider: "google",
    googleId,
    email: normalizedEmail,
    name,
    avatarUrl: picture,
    roles: ["analyst"],
    isActive: true,
    lastLoginAt: new Date(),
  });

  return { user: toSafeUser(user), token: generateAuthToken(user) };
};
