import { Router } from "express";
import {
  getAlerts,
  getAlertById,
  getAlertEvidence,
  updateAlertStatus,
} from "../controllers/alert.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Strict authentication barrier: All alert endpoints require a valid JWT session
router.use(requireAuth);

// 1. List operational alerts with filters and pagination
router.get("/", getAlerts);

// 2. Retrieve alert details with monitored identity snapshot
router.get("/:alertId", getAlertById);

// 3. Retrieve granular behavioral evidence points for an alert
router.get("/:alertId/evidence", getAlertEvidence);

// 4. Update operational investigation status
router.patch("/:alertId/status", updateAlertStatus);

export default router;
