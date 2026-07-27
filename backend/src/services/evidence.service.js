import { createEvidence as createEvidenceRecord } from "../repositories/evidence.repository.js";

export const createEvidence = async (investigationId, payload) =>
  createEvidenceRecord({ investigationId, ...payload });
