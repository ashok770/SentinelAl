import mongoose from "mongoose";

const monitoredIdentitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    businessUnit: {
      type: String,
      required: true,
      trim: true,
    },

    functionalUnit: {
      type: String,
      trim: true,
      default: "General",
    },

    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    team: {
      type: String,
      required: true,
      trim: true,
    },

    supervisor: {
      type: String,
      default: "Executive / Self",
      trim: true,
    },

    firstSeen: {
      type: Date,
    },

    lastSeen: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "monitored_identities",
  },
);

// High-performance operational directory query indexes
monitoredIdentitySchema.index({ department: 1, role: 1 });
monitoredIdentitySchema.index({ businessUnit: 1 });

const MonitoredIdentity = mongoose.model("MonitoredIdentity", monitoredIdentitySchema);

export default MonitoredIdentity;
