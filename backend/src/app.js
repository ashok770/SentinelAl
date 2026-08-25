import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import investigationRoutes from "./routes/investigation.routes.js";

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

app.use("/api/v1/investigations", investigationRoutes);

app.get("/", (req, res) => {
  res.json({
    project: "SentinelAI",
    status: "Backend Running",
    version: "1.0.0",
  });
});

export default app;
