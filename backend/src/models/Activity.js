import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
    },
    action: {
      type: String,
    },
    resource: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
    scenario: {
      type: String,
      index: true,
      // Examples: 'normal_activity', 'unusual_login', 'new_device'
    }
  },
  {
    timestamps: true,
    collection: "activities",
  }
);

// Compound index to quickly fetch user's activities by time
activitySchema.index({ userId: 1, timestamp: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
