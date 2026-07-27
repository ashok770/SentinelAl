import { Router } from "express";

import { createEvidence } from "../controllers/evidence.controller.js";
import {
  createInvestigation,
  getInvestigationDetails,
} from "../controllers/investigation.controller.js";

const router = Router();

router.post("/", createInvestigation);
router.post("/:investigationId/evidence", createEvidence);
router.get("/:investigationId", getInvestigationDetails);

export default router;
