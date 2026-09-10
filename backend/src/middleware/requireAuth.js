import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserById } from "../repositories/user.repository.js";

/**
 * Middleware to require authentication.
 * 1. Checks for JWT in HTTP-only cookie, falling back to Authorization Bearer header.
 * 2. Verifies the token.
 * 3. Looks up the user by ID (excluding passwordHash).
 * 4. Rejects missing, invalid, expired tokens, or non-existent/inactive users with 401.
 * 5. Attaches the safe user object to req.user.
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies[env.COOKIE.NAME];

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, env.JWT.SECRET);

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
