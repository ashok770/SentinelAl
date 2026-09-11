import { env } from "../config/env.js";
import { loginService, signupService, toSafeUser } from "../services/auth.service.js";
import {
  generateOAuthState,
  generateGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  processGoogleLogin,
} from "../services/google-oauth.service.js";

/**
 * Converts a duration string (e.g. "1h", "7d", "30m", "60s") to milliseconds.
 * @param {string|number} expiresIn
 * @returns {number}
 */
const parseExpiresInToMs = (expiresIn) => {
  if (typeof expiresIn === "number") {
    return expiresIn * 1000;
  }
  if (!expiresIn || typeof expiresIn !== "string") {
    return 60 * 60 * 1000;
  }

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000;
  }
};

/**
 * Sets the HTTP-only authentication cookie on the response.
 * @param {import("express").Response} res
 * @param {string} token
 */
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE.SECURE,
    sameSite: env.COOKIE.SAME_SITE,
    maxAge: parseExpiresInToMs(env.JWT.EXPIRES_IN),
  };

  res.cookie(env.COOKIE.NAME, token, cookieOptions);
};

/**
 * Maps errors to standard JSON error responses.
 * @param {import("express").Response} res
 * @param {Error} error
 */
const handleAuthError = (res, error) => {
  // MongoDB duplicate key error (code 11000) - second layer of protection against race conditions
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  // Handled application operational errors (ValidationError -> 400, UnauthorizedError -> 401, etc.)
  if (error.isOperational) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose schema validation errors fallback
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Generic server errors - do not leak internal stack or sensitive data
  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

/**
 * Controller handling user registration (POST /api/v1/auth/signup).
 * Sets the HTTP-only auth cookie and returns the sanitized user payload.
 */
export const signup = async (req, res) => {
  try {
    const { user, token } = await signupService(req.body);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return handleAuthError(res, error);
  }
};

/**
 * Controller handling user login (POST /api/v1/auth/login).
 * Sets the HTTP-only auth cookie and returns the sanitized user payload.
 */
export const login = async (req, res) => {
  try {
    const { user, token } = await loginService(req.body);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
      },
    });
  } catch (error) {
    return handleAuthError(res, error);
  }
};

/**
 * Controller handling user logout (POST /api/v1/auth/logout).
 * Clears the HTTP-only auth cookie.
 */
export const logout = (req, res) => {
  try {
    res.clearCookie(env.COOKIE.NAME, {
      httpOnly: true,
      secure: env.COOKIE.SECURE,
      sameSite: env.COOKIE.SAME_SITE,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return handleAuthError(res, error);
  }
};

/**
 * Controller handling GET /api/v1/auth/me.
 * Returns the current authenticated user.
 */
export const getMe = (req, res) => {
  try {
    const safeUser = toSafeUser(req.user);

    return res.status(200).json({
      success: true,
      data: {
        user: safeUser,
      },
    });
  } catch (error) {
    return handleAuthError(res, error);
  }
};

/**
 * Initiates the Google OAuth flow.
 */
export const googleAuth = (req, res) => {
  const state = generateOAuthState();

  res.cookie("sentinelai_oauth_state", state, {
    httpOnly: true,
    secure: env.COOKIE.SECURE,
    sameSite: env.COOKIE.SAME_SITE,
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/api/v1/auth/google", // covers both /google and /google/callback
  });

  const url = generateGoogleAuthUrl(state);
  res.redirect(url);
};

/**
 * Handles the Google OAuth callback.
 */
export const googleAuthCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const cookieState = req.cookies.sentinelai_oauth_state;

  // Clear state cookie safely
  res.clearCookie("sentinelai_oauth_state", {
    httpOnly: true,
    secure: env.COOKIE.SECURE,
    sameSite: env.COOKIE.SAME_SITE,
    path: "/api/v1/auth/google",
  });

  if (error) {
    return res.redirect(`${env.FRONTEND_URL}/auth?mode=login&error=google_auth_denied`);
  }

  if (!state || !cookieState || state !== cookieState) {
    return res.redirect(`${env.FRONTEND_URL}/auth?mode=login&error=oauth_state_invalid`);
  }

  try {
    const accessToken = await exchangeGoogleCode(code);
    const userInfo = await getGoogleUserInfo(accessToken);
    const { user, token } = await processGoogleLogin(userInfo);

    setAuthCookie(res, token);
    return res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    if (err.isConflict) {
      return res.redirect(`${env.FRONTEND_URL}/auth?mode=login&error=google_account_requires_existing_login`);
    }
    return res.redirect(`${env.FRONTEND_URL}/auth?mode=login&error=google_auth_failed`);
  }
};
