import { createEvidence as createEvidenceService } from "../services/evidence.service.js";

export const createEvidence = async (req, res) => {
  try {
    const evidence = await createEvidenceService(
      req.params.investigationId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: "Evidence added successfully",
      data: evidence,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
