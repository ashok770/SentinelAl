import { Router } from "express";
import {
  getActivities,
  getActivitiesByUser,
  getDemoUsers
} from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Protect all activity routes with JWT authentication
router.use(requireAuth);

router.get("/", getActivities);
router.get("/users", getDemoUsers);
router.get("/users/:userId", getActivitiesByUser);

export default router;
