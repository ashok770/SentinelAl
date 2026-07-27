import Evidence from "../models/Evidence.js";
import Investigation from "../models/Investigation.js";

export const createInvestigation = async (data) => Investigation.create(data);

export const getInvestigationById = async (id) => {
  console.log("Requested Investigation ID:", id);

  const investigation = await Investigation.findById(id);

  console.log("Found Investigation:", investigation);

  return investigation;
};

export const getEvidenceByInvestigationId = async (investigationId) =>
  Evidence.find({ investigationId }).sort({ timestamp: 1 });
