import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import {
  findUserByEmail,
  saveUser,
} from "../repositories/user.repository.js";
import {
  DuplicateEmailError,
  ValidationError,
} from "../utils/errors.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

/**
 * Validates and normalizes signup input.
 * @param {Object} data
 * @returns {{ normalizedName: string, normalizedEmail: string, password: string }}
 */
const validateSignupData = (data) => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Signup data is required");
  }

  const { name, email, password } = data;

  if (typeof name !== "string" || name.trim().length < MIN_NAME_LENGTH) {
    throw new ValidationError(
      `Name is required and must be at least ${MIN_NAME_LENGTH} characters`,
    );
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    throw new ValidationError("A valid email address is required");
  }

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(
      `Password is required and must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }

  return {
    normalizedName: name.trim(),
    normalizedEmail: email.trim().toLowerCase(),
    password,
  };
};

/**
 * Returns a sanitized representation of the user without sensitive fields.
 * @param {import("../models/User.js").default} user
 * @returns {Object}
 */
const toSafeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;

  return {
    _id: userObj._id,
    name: userObj.name,
    email: userObj.email,
    roles: userObj.roles,
    provider: userObj.provider,
    isActive: userObj.isActive,
    avatarUrl: userObj.avatarUrl,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
};

/**
 * Generates an authentication JWT for a user.
 * @param {Object} user
 * @returns {string}
 */
export const generateAuthToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    roles: user.roles,
  };

  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN,
  });
};

/**
 * Handles signup business logic:
 * - Validates input
 * - Checks for duplicate email
 * - Creates local user and hashes password via User.setPassword()
 * - Persists through user repository
 * - Generates JWT token
 * - Returns safe user and token
 *
 * @param {Object} signupData
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const signupService = async (signupData) => {
  const { normalizedName, normalizedEmail, password } =
    validateSignupData(signupData);

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new DuplicateEmailError("An account with this email already exists");
  }

  const user = new User({
    name: normalizedName,
    email: normalizedEmail,
    provider: "local",
  });

  await user.setPassword(password);
  const savedUser = await saveUser(user);

  const token = generateAuthToken(savedUser);
  const safeUser = toSafeUser(savedUser);

  return {
    user: safeUser,
    token,
  };
};
