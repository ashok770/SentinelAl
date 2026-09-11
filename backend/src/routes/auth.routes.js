import { Router } from "express";
import {
  login,
  signup,
  getMe,
  logout,
  googleAuth,
  googleAuthCallback,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
