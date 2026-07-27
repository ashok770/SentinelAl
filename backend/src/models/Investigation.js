import mongoose from "mongoose";

import {
  INVESTIGATION_STATUS,
  INVESTIGATION_SEVERITY,
  INVESTIGATION_SOURCE,
} from "../constants/investigation.constants.js";

const investigationSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      required: true,
      enum: Object.values(INVESTIGATION_SOURCE),
    },

    severity: {
      type: String,
      required: true,
      enum: Object.values(INVESTIGATION_SEVERITY),
      default: INVESTIGATION_SEVERITY.MEDIUM,
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(INVESTIGATION_STATUS),
      default: INVESTIGATION_STATUS.OPEN,
    },
  },
  {
    timestamps: true,
    collection: "investigations",
  },
);

const Investigation = mongoose.model("Investigation", investigationSchema);

export default Investigation;
