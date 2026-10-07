import {
  createInvestigation as createInvestigationService,
  getInvestigationDetails as getInvestigationDetailsService,
  getInvestigations as getInvestigationsService,
} from "../services/investigation.service.js";
import InvestigationIntelligenceService from "../services/InvestigationIntelligenceService.js";

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

export const getInvestigations = async (req, res) => {
  try {
    const investigations = await getInvestigationsService();

    return res.status(200).json({
      success: true,
      data: {
        investigations,
        count: investigations.length,
      },
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

export const getAlertContext = async (req, res) => {
  try {
    const { alertId } = req.params;
    const context = await InvestigationIntelligenceService.getAlertContext(alertId);

    return res.status(200).json({
      status: "success",
      data: context
    });
  } catch (error) {
    if (error.message === "Alert not found" || error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching alert context:", error);
    return res.status(500).json({ error: "Failed to fetch alert context" });
  }
};
