import {
  createInvestigation as createInvestigationRecord,
  getEvidenceByInvestigationId,
  getInvestigationById,
} from "../repositories/investigation.repository.js";

export const createInvestigation = async (data) =>
  createInvestigationRecord(data);

export const getInvestigationDetails = async (investigationId) => {
  const [investigation, evidence] = await Promise.all([
    getInvestigationById(investigationId),
    getEvidenceByInvestigationId(investigationId),
  ]);

  return { investigation, evidence };
};
