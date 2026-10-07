import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import investigationRoutes from "./routes/investigation.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import riskRoutes from "./routes/risk.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/investigations", investigationRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/analysis", analysisRoutes);
app.use("/api/v1/risk", riskRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    project: "SentinelAI",
    status: "Backend Running",
    version: "1.0.0",
  });
});

export default app;
