import { Router } from "express";

import { createEvidence } from "../controllers/evidence.controller.js";
import { createInvestigation } from "../controllers/investigation.controller.js";

const router = Router();

router.post("/", createInvestigation);
router.post("/:investigationId/evidence", createEvidence);

export default router;
