import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Stored as a bcrypt hash only. Never persisted or returned by default
    // (select: false) and never read back unless explicitly selected.
    passwordHash: {
      type: String,
      select: false,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Populated only for Google OAuth accounts (added in a later slice).
    // Sparse unique index allows many documents without a googleId.
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    name: {
      type: String,
      trim: true,
    },

    avatarUrl: {
      type: String,
    },

    // Reserved for future RBAC (e.g. "analyst", "admin").
    roles: {
      type: [String],
      default: ["analyst"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

// Reusable password helpers for future authentication services.
// Hashing lives here at the model/service boundary so controllers and
// routes never handle plaintext passwords or hashes directly.
userSchema.methods.setPassword = async function setPassword(plainPassword) {
  if (!plainPassword) {
    throw new Error("Password is required");
  }

  this.passwordHash = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
};

userSchema.methods.comparePassword = async function comparePassword(
  plainPassword,
) {
  if (!plainPassword || !this.passwordHash) {
    return false;
  }

  return bcrypt.compare(plainPassword, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

export default User;
