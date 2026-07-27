import mongoose from "mongoose";

import { EVIDENCE_TYPE } from "../constants/evidence.constants.js";

const evidenceSchema = new mongoose.Schema(
  {
    investigationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investigation",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: Object.values(EVIDENCE_TYPE),
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "evidence",
  },
);

// Indexes
evidenceSchema.index({ investigationId: 1 });
evidenceSchema.index({ type: 1 });

const Evidence = mongoose.model("Evidence", evidenceSchema);

export default Evidence;
