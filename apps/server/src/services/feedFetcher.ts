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
  } catch (error) {
    console.error(`Failed to fetch feed ${feed.url}:`, error);
  }
}

async function updateFeedTimestamp(
  feedId: string,
  cacheHeaders?: { etag?: string; lastModified?: string },
): Promise<void> {
  await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
      ...cacheHeaders,
    })
    .where(eq(feeds.id, feedId));
}

function deriveSummaryStatus(
  result: { skipped?: boolean; detailedSummary?: string | null },
  feedType: string,
): "skipped" | "completed" | "failed" {
  if (result.skipped) return "skipped";
  if (feedType === "github-releases" && !result.detailedSummary) return "failed";
  return "completed";
}

async function fetchRssFeed(feed: Feed): Promise<void> {
  const result = await parseRssFeed(feed.url, {
    etag: feed.lastEtag,
    lastModified: feed.lastModified,
  });

  if (result === null) {
    console.log(`[feedFetcher] feed ${feed.id} not modified (304)`);
    await updateFeedTimestamp(feed.id);
    return;
  }

  const { feed: parsed, etag, lastModified } = result;
  const cacheHeaders = {
    lastEtag: etag ?? feed.lastEtag ?? undefined,
    lastModified: lastModified ?? feed.lastModified ?? undefined,
  };

  const itemsWithGuid = parsed.items.filter((item) => item.guid);

  const skipOgp = feed.feedType === "github-releases";

  const rows = itemsWithGuid.map((item) => ({
    feedId: feed.id,
    title: item.title,
    url: item.url,
    contentHtml: item.contentHtml,
    contentText: item.contentText,
    author: item.author,
    publishedAt: item.publishedAt,
    guid: item.guid,
    ogImageUrl: item.imageUrl,
  }));

  if (rows.length === 0) {
    await updateFeedTimestamp(feed.id, cacheHeaders);
    return;
  }

  const inserted = await db.insert(entries).values(rows).onConflictDoNothing().returning({
    id: entries.id,
    url: entries.url,
    contentText: entries.contentText,
    ogImageUrl: entries.ogImageUrl,
  });

  console.log(`[feedFetcher] inserted ${inserted.length} new entries for feed ${feed.id}`);

  await updateFeedTimestamp(feed.id, cacheHeaders);

  if (!skipOgp) {
    updateOgpInBackground(inserted, feed.id);
  }

  if (inserted.length > 0) {
    summarizeInBackground(inserted, feed.feedType);
  }
}

type InsertedEntry = {
  id: string;
  url: string | null;
  contentText: string | null;
  ogImageUrl: string | null;
};

function updateOgpInBackground(inserted: InsertedEntry[], feedId: string): void {
  const needsOgp = inserted.filter((e) => !e.ogImageUrl && e.url);
  if (needsOgp.length === 0) return;

  fetchOgImages(needsOgp.map((e) => ({ url: e.url ?? undefined })))
    .then(async (images) => {
      for (let i = 0; i < needsOgp.length; i++) {
        if (images[i]) {
          await db
            .update(entries)
            .set({ ogImageUrl: images[i] })
            .where(eq(entries.id, needsOgp[i].id));
        }
      }
      console.log(`[feedFetcher] OGP images updated for feed ${feedId}`);
    })
    .catch((error) => {
      console.error("[feedFetcher] OGP fetch failed:", error);
    });
}

function summarizeInBackground(inserted: InsertedEntry[], feedType: Feed["feedType"]): void {
  summarizeItems(
    inserted.map((e) => ({ id: e.id, text: e.contentText })),
    feedType,
  )
    .then(async (summaries) => {
      console.log(
        `[feedFetcher] summarization done: ${summaries.size}/${inserted.length} items got summaries`,
      );
      for (const e of inserted) {
        const summaryResult = summaries.get(e.id);
        if (summaryResult) {
          const summaryStatus = deriveSummaryStatus(summaryResult, feedType);
          await db
            .update(entries)
            .set({
              summary: summaryResult.summary,
              detailedSummary: summaryResult.detailedSummary ?? null,
              summaryStatus,
            })
            .where(eq(entries.id, e.id));
        } else {
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
