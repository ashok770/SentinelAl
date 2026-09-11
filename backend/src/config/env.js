import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// JWT_SECRET must be set via the environment in production.
// The fallback below is a development-only placeholder so the local server
// can boot without a configured secret. It MUST NEVER be used in production.
const jwtSecret =
  process.env.JWT_SECRET || "development-only-insecure-jwt-secret";

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required when NODE_ENV is production",
  );
}

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Authentication infrastructure configuration.
  JWT: {
    SECRET: jwtSecret,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  },

  COOKIE: {
    NAME: process.env.COOKIE_NAME || "sentinelai_token",
    SECURE: process.env.COOKIE_SECURE === "true",
    SAME_SITE: process.env.COOKIE_SAME_SITE || "lax",
  },

  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback",
  },
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
