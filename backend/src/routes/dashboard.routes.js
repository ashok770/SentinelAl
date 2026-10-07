import { Router } from "express";
import {
  getSummary,
  getOverview,
  getSeverityDistribution,
  getAlertTrend,
  getTopDepartments,
  getPriorityQueue,
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Protect all dashboard routes with JWT authentication
router.use(requireAuth);

router.get("/", getOverview);
router.get("/summary", getSummary);
router.get("/severity-distribution", getSeverityDistribution);
router.get("/trend", getAlertTrend);
router.get("/top-departments", getTopDepartments);
router.get("/priority-queue", getPriorityQueue);

export default router;
