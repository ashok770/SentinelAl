import { createInvestigation as createInvestigationRecord } from "../repositories/investigation.repository.js";

export const createInvestigation = async (data) =>
  createInvestigationRecord(data);
