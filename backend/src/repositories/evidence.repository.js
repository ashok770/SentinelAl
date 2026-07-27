import Evidence from "../models/Evidence.js";

export const createEvidence = async (data) => Evidence.create(data);
