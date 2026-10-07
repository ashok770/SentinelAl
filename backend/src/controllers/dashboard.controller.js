import dashboardService from "../services/DashboardService.js";
import { AppError } from "../utils/errors.js";

/**
 * SentinelAI — Dashboard Controller (Phase 4C)
 * ============================================
 * Handles HTTP requests and responses for Security Overview Dashboard metrics.
 * Protects controller logic with proper error handling and clean JSON structures.
 */

/**
 * GET /api/v1/dashboard/summary
 * Retrieves full dashboard overview metrics (KPIs, severity, status, trends, top departments, priority queue).
 */
export const getSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getSummary();
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    if (error instanceof AppError || error.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error in getSummary dashboard controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};

/**
 * GET /api/v1/dashboard
 * Root alias for dashboard summary.
 */
export const getOverview = async (req, res) => {
  try {
    const overview = await dashboardService.getOverview();
    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    if (error instanceof AppError || error.statusCode) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error in getOverview dashboard controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
    });
  }
};

/**
 * GET /api/v1/dashboard/severity-distribution
 */
export const getSeverityDistribution = async (req, res) => {
  try {
    const distribution = await dashboardService.getSeverityDistribution();
    return res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error("Error in getSeverityDistribution controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch severity distribution",
    });
  }
};

/**
 * GET /api/v1/dashboard/trend
 */
export const getAlertTrend = async (req, res) => {
  try {
    const trend = await dashboardService.getAlertTrend();
    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    console.error("Error in getAlertTrend controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert trend",
    });
  }
};

/**
 * GET /api/v1/dashboard/top-departments
 */
export const getTopDepartments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const departments = await dashboardService.getTopDepartments(limit);
    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error in getTopDepartments controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top departments",
    });
  }
};

/**
 * GET /api/v1/dashboard/priority-queue
 */
export const getPriorityQueue = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const queue = await dashboardService.getPriorityQueue(limit);
    return res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error("Error in getPriorityQueue controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch priority queue",
    });
  }
};
