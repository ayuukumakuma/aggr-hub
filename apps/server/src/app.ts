import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { feedRoutes } from "./routes/feeds.js";
import { entryRoutes } from "./routes/entries.js";
import { healthRoutes } from "./routes/health.js";

const app = new Hono()
  .use("*", logger())
  .use("/api/*", cors({ origin: "http://localhost:5173" }))
  .route("/api/v1", healthRoutes)
  .route("/api/v1", feedRoutes)
  .route("/api/v1", entryRoutes);

export type AppType = typeof app;
export default app;
