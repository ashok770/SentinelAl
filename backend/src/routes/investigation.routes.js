import { Router } from "express";

import { createInvestigation } from "../controllers/investigation.controller.js";

const router = Router();

router.post("/", createInvestigation);

export default router;
