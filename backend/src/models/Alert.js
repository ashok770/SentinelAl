import mongoose from "mongoose";
import { ALERT_SEVERITY, ALERT_STATUS } from "../constants/alert.constants.js";

const alertSchema = new mongoose.Schema(
  {
    // Primary stable identifier from Phase 3B deterministic aggregation
    alertId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Monitored employee identifier
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Monitored employee snapshot at time of episode
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    businessUnit: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
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

    // Operational classification & analyst state
    severity: {
      type: String,
      required: true,
      enum: Object.values(ALERT_SEVERITY),
      index: true,
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(ALERT_STATUS),
      default: ALERT_STATUS.OPEN,
      index: true,
    },

    // Anomaly scores and episode bounds
    peakScore: {
      type: Number,
      required: true,
      min: 80,
      max: 100,
    },

    meanScore: {
      type: Number,
      required: true,
      min: 80,
      max: 100,
    },

    firstSeen: {
      type: Date,
      required: true,
      index: true,
    },

    lastSeen: {
      type: Date,
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },

    anomalousDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Daily score time-series across the episode
    scoreTrajectory: {
      type: Array,
      default: [],
    },

    // Peak scores from component unsupervised detectors
    statisticalScorePeak: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    isolationForestScorePeak: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Behavioral dimension summary counts
    newDeviceDays: {
      type: Number,
      default: 0,
    },

    afterHoursDays: {
      type: Number,
      default: 0,
    },

    fileBurstDays: {
      type: Number,
      default: 0,
    },

    deviceFileSequenceDays: {
      type: Number,
      default: 0,
    },

    weekendActivityDays: {
      type: Number,
      default: 0,
    },

    // Synthesized evidence narratives and contributing dimensions
    activitySummary: {
      type: String,
      required: true,
      trim: true,
    },

    evidenceSummary: {
      type: Array,
      default: [],
    },

    contributingDimensions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Analyst action timestamps
    acknowledgedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "alerts",
  },
);

// High-performance operational query indexes
alertSchema.index({ userId: 1, firstSeen: -1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ status: 1, firstSeen: -1 });
alertSchema.index({ severity: 1, firstSeen: -1 });
alertSchema.index({ updatedAt: -1 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
