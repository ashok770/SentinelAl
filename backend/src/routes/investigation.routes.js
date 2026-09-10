import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { createEvidence } from "../controllers/evidence.controller.js";
import {
  createInvestigation,
  getInvestigationDetails,
  getInvestigations,
} from "../controllers/investigation.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createInvestigation);
router.post("/:investigationId/evidence", createEvidence);
router.get("/", getInvestigations);
router.get("/:investigationId", getInvestigationDetails);

export default router;
