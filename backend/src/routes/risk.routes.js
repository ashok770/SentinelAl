import { Router } from "express";
import {
  getUserRisk,
  getAllRisk
} from "../controllers/risk.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Protect all risk routes with JWT authentication
router.use(requireAuth);

router.get("/", getAllRisk);
router.get("/users/:userId", getUserRisk);

export default router;
