import Evidence from "../models/Evidence.js";
import Investigation from "../models/Investigation.js";

export const createInvestigation = async (data) => Investigation.create(data);

export const getInvestigationById = async (id) => Investigation.findById(id);

export const getEvidenceByInvestigationId = async (investigationId) =>
  Evidence.find({ investigationId }).sort({ timestamp: 1 });
