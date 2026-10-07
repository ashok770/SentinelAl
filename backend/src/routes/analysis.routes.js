import { Router } from "express";
import {
  getUserAnalysis,
  getAllAnalysis
} from "../controllers/analysis.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Protect all analysis routes with JWT authentication
router.use(requireAuth);

router.get("/", getAllAnalysis);
router.get("/users/:userId", getUserAnalysis);

export default router;
