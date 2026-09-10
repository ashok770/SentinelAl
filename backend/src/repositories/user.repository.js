import User from "../models/User.js";

/**
 * Find a user document by normalized email.
 * @param {string} email
 * @param {Object} [options]
 * @param {boolean} [options.includePassword=false]
 * @returns {Promise<import("../models/User.js").default | null>}
 */
export const findUserByEmail = async (
  email,
  { includePassword = false } = {},
) => {
  if (!email) return null;
  const query = User.findOne({ email: email.toLowerCase().trim() });
  if (includePassword) {
    query.select("+passwordHash");
  }
  return query;
};

/**
 * Find a user document by its MongoDB ObjectId.
 * @param {string} id
 * @returns {Promise<import("../models/User.js").default | null>}
 */
export const findUserById = async (id) => {
  return User.findById(id);
};

/**
 * Create and persist a new user document.
 * Accepts either a User document instance or raw user data object.
 * @param {Object|import("../models/User.js").default} userOrData
 * @returns {Promise<import("../models/User.js").default>}
 */
export const createUser = async (userOrData) => {
  if (userOrData instanceof User) {
    return userOrData.save();
  }
  const user = new User(userOrData);
  return user.save();
};

/**
 * Save an existing User document instance.
 * @param {import("../models/User.js").default} user
 * @returns {Promise<import("../models/User.js").default>}
 */
export const saveUser = async (user) => {
  return user.save();
};

/**
 * Updates a user's lastLoginAt timestamp.
 * @param {string} userId
 * @param {Date} [timestamp=new Date()]
 * @returns {Promise<import("../models/User.js").default | null>}
 */
export const updateUserLastLogin = async (userId, timestamp = new Date()) => {
  return User.findByIdAndUpdate(
    userId,
    { lastLoginAt: timestamp },
    { new: true },
  );
};
