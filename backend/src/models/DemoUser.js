import mongoose from "mongoose";

const demoUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
    },
    role: {
      type: String,
    },
    normalWorkingHours: {
      start: String, // e.g., "08:30"
      end: String,   // e.g., "17:30"
    },
    normalDevices: {
      type: [String],
      default: [],
    },
    riskBaseline: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "demo_users",
  }
);

const DemoUser = mongoose.model("DemoUser", demoUserSchema);

export default DemoUser;
