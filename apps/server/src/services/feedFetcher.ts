import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { feeds, entries, type feeds as FeedsTable } from "../db/schema.js";
import { parseRssFeed } from "./rssParser.js";
import { fetchOgImages } from "./ogpFetcher.js";
import { summarizeItems } from "./summarizer.js";

type Feed = typeof FeedsTable.$inferSelect;

export async function fetchAndStoreFeed(feed: Feed): Promise<void> {
  try {
    await fetchRssFeed(feed);

    await db
      .update(feeds)
      .set({ lastFetchedAt: new Date(), updatedAt: new Date() })
      .where(eq(feeds.id, feed.id));
  } catch (error) {
    console.error(`Failed to fetch feed ${feed.url}:`, error);
  }
}

async function fetchRssFeed(feed: Feed): Promise<void> {
  const parsed = await parseRssFeed(feed.url);

  const itemsWithGuid = parsed.items.filter((item) => item.guid);

  // Skip OGP fetching for github-releases feeds
  const skipOgp = feed.feedType === "github-releases";
  const ogpImages = skipOgp
    ? []
    : await fetchOgImages(
        itemsWithGuid.map((item) => ({
          url: item.imageUrl ? undefined : item.url,
        })),
      );

  const rows = itemsWithGuid.map((item, i) => ({
    feedId: feed.id,
    title: item.title,
    url: item.url,
    contentHtml: item.contentHtml,
    contentText: item.contentText,
    author: item.author,
    publishedAt: item.publishedAt,
    guid: item.guid,
    ogImageUrl: skipOgp ? undefined : (item.imageUrl ?? ogpImages[i]),
  }));

  if (rows.length === 0) return;

  const inserted = await db
    .insert(entries)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: entries.id, contentText: entries.contentText });

  console.log(`[feedFetcher] inserted ${inserted.length} new entries for feed ${feed.id}`);

  if (inserted.length > 0) {
    // Fire-and-forget: summarize in background
    summarizeItems(
      inserted.map((e) => ({ id: e.id, text: e.contentText })),
      feed.feedType,
    )
      .then(async (summaries) => {
        console.log(
          `[feedFetcher] summarization done: ${summaries.size}/${inserted.length} items got summaries`,
        );
        for (const e of inserted) {
          const result = summaries.get(e.id);
          if (result) {
            const summaryStatus = result.skipped
              ? ("skipped" as const)
              : feed.feedType === "github-releases"
                ? result.detailedSummary
                  ? "completed"
                  : "failed"
                : "completed";
            console.log(
              `[feedFetcher] entry ${e.id}: status=${summaryStatus}, summary=${!!result.summary}, detailed=${!!result.detailedSummary}`,
            );
            await db
              .update(entries)
              .set({
                summary: result.summary,
                detailedSummary: result.detailedSummary ?? null,
                summaryStatus,
              })
              .where(eq(entries.id, e.id));
          } else {
            console.log(`[feedFetcher] entry ${e.id}: no summary result, marking failed`);
            await db.update(entries).set({ summaryStatus: "failed" }).where(eq(entries.id, e.id));
          }
        }
      })
      .catch(async (error) => {
        console.error("[feedFetcher] background summarization failed:", error);
        for (const e of inserted) {
          await db.update(entries).set({ summaryStatus: "failed" }).where(eq(entries.id, e.id));
        }
      });
  }
}
