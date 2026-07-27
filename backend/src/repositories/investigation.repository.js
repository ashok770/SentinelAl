import Investigation from "../models/Investigation.js";

export const createInvestigation = async (data) => Investigation.create(data);
