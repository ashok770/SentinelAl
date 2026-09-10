import User from "../models/User.js";

/**
 * Find a user document by normalized email.
 * @param {string} email
 * @returns {Promise<import("../models/User.js").default | null>}
 */
export const findUserByEmail = async (email) => {
  if (!email) return null;
  return User.findOne({ email: email.toLowerCase().trim() });
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
