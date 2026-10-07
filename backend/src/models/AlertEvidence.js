import mongoose from "mongoose";
import { EVIDENCE_SEVERITY } from "../constants/alert.constants.js";

const alertEvidenceSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    evidenceType: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      required: true,
      enum: Object.values(EVIDENCE_SEVERITY),
      default: EVIDENCE_SEVERITY.MEDIUM,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    dimension: {
      type: String,
      required: true,
      trim: true,
    },

    dimensionValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "alert_evidence",
  },
);

// Compound unique index ensuring idempotency and zero duplicate evidence per alert dimension
alertEvidenceSchema.index({ alertId: 1, evidenceType: 1, dimension: 1 }, { unique: true });
alertEvidenceSchema.index({ userId: 1, evidenceType: 1 });

const AlertEvidence = mongoose.model("AlertEvidence", alertEvidenceSchema);

export default AlertEvidence;
