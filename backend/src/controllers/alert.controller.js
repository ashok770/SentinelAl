import alertService from "../services/AlertService.js";
import { AppError } from "../utils/errors.js";

/**
 * SentinelAI — Operational Alert Controller (Phase 4B)
 * =====================================================
 * Handles HTTP requests, parameter extraction, and status responses for Alert endpoints.
 * Contains no direct database queries.
 */

/**
 * GET /api/v1/alerts
 * Lists paginated operational alerts with filtering and sorting.
 */
export const getAlerts = async (req, res) => {
  try {
    const result = await alertService.listAlerts(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError || error.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error in getAlerts controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving alerts",
    });
  }
};

/**
 * GET /api/v1/alerts/:alertId
 * Retrieves full details for a single operational alert.
 */
export const getAlertById = async (req, res) => {
  try {
    const { alertId } = req.params;
    const result = await alertService.getAlertById(alertId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError || error.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error in getAlertById controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving the alert",
    });
  }
};

/**
 * GET /api/v1/alerts/:alertId/evidence
 * Retrieves paginated behavioral evidence items for a specific alert.
 */
export const getAlertEvidence = async (req, res) => {
  try {
    const { alertId } = req.params;
    const result = await alertService.getAlertEvidence(alertId, req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError || error.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error in getAlertEvidence controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving alert evidence",
    });
  }
};

/**
 * PATCH /api/v1/alerts/:alertId/status
 * Updates only the operational status of an alert.
 */
export const updateAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const updatedAlert = await alertService.updateAlertStatus(alertId, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: "Alert operational status updated successfully",
      data: updatedAlert,
    });
  } catch (error) {
    if (error instanceof AppError || error.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error in updateAlertStatus controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while updating alert status",
    });
  }
};
