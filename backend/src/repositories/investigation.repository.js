import Evidence from "../models/Evidence.js";
import Investigation from "../models/Investigation.js";

export const createInvestigation = async (data) => Investigation.create(data);

export const getInvestigations = async () =>
  Investigation.find().sort({ createdAt: -1 });

export const getInvestigationById = async (id) => {
  const investigation = await Investigation.findById(id);

  return investigation;
};

export const getEvidenceByInvestigationId = async (investigationId) =>
  Evidence.find({ investigationId }).sort({ timestamp: 1 });
