import { createInvestigation as createInvestigationService } from "../services/investigation.service.js";

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
