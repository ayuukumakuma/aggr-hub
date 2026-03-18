import cron from "node-cron";
import { and, eq, or, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { feeds } from "../db/schema.js";
import { fetchAndStoreFeed } from "../services/feedFetcher.js";

export function startScheduler(): void {
  // Check every 15 minutes for feeds that need refreshing
  cron.schedule("*/15 * * * *", async () => {
    console.log("[cron] Checking for feeds to refresh...");

    const dueFeeds = await db
      .select()
      .from(feeds)
      .where(
        and(
          eq(feeds.isActive, true),
          or(
            isNull(feeds.lastFetchedAt),
            sql`${feeds.lastFetchedAt} + (${feeds.fetchIntervalMinutes} || ' minutes')::interval < now()`,
          ),
        ),
      );

    console.log(`[cron] Found ${dueFeeds.length} feeds to refresh`);

    const results = await Promise.allSettled(dueFeeds.map((feed) => fetchAndStoreFeed(feed)));
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        console.error(`[cron] Failed to refresh feed ${dueFeeds[i].url}:`, result.reason);
      }
    }
  });

  console.log("[cron] Scheduler started (every 15 minutes)");
}
