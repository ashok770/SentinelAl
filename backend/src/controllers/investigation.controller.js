import {
  createInvestigation as createInvestigationService,
  getInvestigationDetails as getInvestigationDetailsService,
} from "../services/investigation.service.js";

export const createInvestigation = async (req, res) => {
  try {
    const createdInvestigation = await createInvestigationService(req.body);

    return res.status(201).json({
      success: true,
      message: "Investigation created successfully",
      data: createdInvestigation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvestigationDetails = async (req, res) => {
  try {
    const { investigation, evidence } = await getInvestigationDetailsService(
      req.params.investigationId,
    );

    return res.status(200).json({
      success: true,
      data: { investigation, evidence },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
