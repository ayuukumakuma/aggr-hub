import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { feeds, entries, type feeds as FeedsTable } from "../db/schema.js";
import { parseRssFeed } from "./rssParser.js";
import {
  type ChangelogItem,
  isGitHubReleasesUrl,
  parseGitHubReleases,
  parseChangelogMd,
} from "./changelogParser.js";
import { computeDiffHtml } from "./diffService.js";
import { fetchOgImages } from "./ogpFetcher.js";

type Feed = typeof FeedsTable.$inferSelect;

export async function fetchAndStoreFeed(feed: Feed): Promise<void> {
  try {
    if (feed.feedType === "changelog") {
      await fetchChangelogFeed(feed);
    } else {
      await fetchRssFeed(feed);
    }

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

  // Items without RSS-embedded images need OGP fallback
  const itemsNeedingOgp = parsed.items.map((item) => ({
    url: item.imageUrl ? undefined : item.url,
  }));
  const ogpImages = await fetchOgImages(itemsNeedingOgp);

  const rows = parsed.items
    .filter((item) => item.guid)
    .map((item, i) => ({
      feedId: feed.id,
      title: item.title,
      url: item.url,
      contentHtml: item.contentHtml,
      contentText: item.contentText,
      author: item.author,
      publishedAt: item.publishedAt,
      guid: item.guid,
      ogImageUrl: item.imageUrl ?? ogpImages[i],
    }));

  if (rows.length > 0) {
    await db.insert(entries).values(rows).onConflictDoNothing();
  }
}

async function fetchChangelogFeed(feed: Feed): Promise<void> {
  let items: ChangelogItem[];

  if (isGitHubReleasesUrl(feed.url)) {
    const parsed = await parseGitHubReleases(feed.url);
    items = parsed.items;
  } else {
    const parsed = await parseChangelogMd(feed.url);
    items = parsed.items;
  }

  // Get existing entries for diff computation
  const existingEntries = await db
    .select({ version: entries.version, rawChangelog: entries.rawChangelog })
    .from(entries)
    .where(eq(entries.feedId, feed.id))
    .orderBy(desc(entries.publishedAt));

  const rows = items
    .filter((item) => item.guid)
    .map((item, i) => {
      const rawChangelog = item.rawChangelog ?? item.contentText;
      let diffHtml: string | undefined;

      if (rawChangelog) {
        const prevItem = items[i + 1];
        const prevText = prevItem?.rawChangelog ?? prevItem?.contentText;

        if (!prevText) {
          const prevExisting = existingEntries.find((e) => e.version && e.version !== item.version);
          if (prevExisting?.rawChangelog) {
            diffHtml = computeDiffHtml(prevExisting.rawChangelog, rawChangelog);
          }
        } else {
          diffHtml = computeDiffHtml(prevText, rawChangelog);
        }
      }

      return {
        feedId: feed.id,
        title: item.title,
        url: item.url,
        contentText: item.contentText,
        author: item.author,
        publishedAt: item.publishedAt,
        guid: item.guid,
        version: item.version ?? item.title,
        rawChangelog: rawChangelog,
        diffHtml,
      };
    });

  if (rows.length > 0) {
    await db.insert(entries).values(rows).onConflictDoNothing();
  }
}
