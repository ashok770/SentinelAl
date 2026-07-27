import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log("🛡 SentinelAI Backend Started");
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

startServer();
