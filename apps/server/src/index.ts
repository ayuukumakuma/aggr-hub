import { serve } from "@hono/node-server";
import app from "./app.js";
import { startScheduler } from "./cron/scheduler.js";

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

startScheduler();
