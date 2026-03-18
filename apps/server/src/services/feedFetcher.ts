import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { feeds, entries, type feeds as FeedsTable } from "../db/schema.js";
import { parseRssFeed } from "./rssParser.js";
import {
  type ChangelogItem,
  isGitHubReleasesUrl,
  isChangelogMdUrl,
  parseGitHubReleases,
  parseChangelogMd,
} from "./changelogParser.js";
import { computeDiffHtml } from "./diffService.js";
import { fetchOgImages } from "./ogpFetcher.js";

type Feed = typeof FeedsTable.$inferSelect;

interface DetectedFeed {
  feedUrl: string;
  title: string | undefined;
  siteUrl: string | undefined;
  feedType: "rss" | "atom" | "changelog";
  description: string | undefined;
}

export async function detectAndParseFeed(url: string): Promise<DetectedFeed> {
  if (isGitHubReleasesUrl(url)) {
    const parsed = await parseGitHubReleases(url);
    return {
      feedUrl: url,
      title: parsed.title,
      siteUrl: parsed.siteUrl,
      feedType: "changelog",
      description: undefined,
    };
  }

  if (isChangelogMdUrl(url)) {
    const parsed = await parseChangelogMd(url);
    return {
      feedUrl: url,
      title: parsed.title,
      siteUrl: undefined,
      feedType: "changelog",
      description: undefined,
    };
  }

  // Try RSS/Atom
  const res = await fetch(url, { redirect: "follow" });
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();

  // Check if HTML with RSS autodiscovery
  if (contentType.includes("html")) {
    const linkMatch = body.match(
      /<link[^>]+type=["']application\/(rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/i,
    );
    if (linkMatch) {
      const feedUrl = new URL(linkMatch[2], url).toString();
      const parsed = await parseRssFeed(feedUrl);
      return {
        feedUrl,
        title: parsed.title,
        siteUrl: parsed.siteUrl,
        feedType: linkMatch[1] === "atom" ? "atom" : "rss",
        description: parsed.description,
      };
    }
    throw new Error(
      "No RSS/Atom feed found. Provide a direct feed URL or a page with feed autodiscovery.",
    );
  }

  // Assume XML feed
  const parsed = await parseRssFeed(url);
  const isAtom = body.includes("<feed") && body.includes('xmlns="http://www.w3.org/2005/Atom"');

  return {
    feedUrl: url,
    title: parsed.title,
    siteUrl: parsed.siteUrl,
    feedType: isAtom ? "atom" : "rss",
    description: parsed.description,
  };
}

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

  for (let i = 0; i < parsed.items.length; i++) {
    const item = parsed.items[i];
    if (!item.guid) continue;

    const ogImageUrl = item.imageUrl ?? ogpImages[i];

    await db
      .insert(entries)
      .values({
        feedId: feed.id,
        title: item.title,
        url: item.url,
        contentHtml: item.contentHtml,
        contentText: item.contentText,
        author: item.author,
        publishedAt: item.publishedAt,
        guid: item.guid,
        ogImageUrl,
      })
      .onConflictDoNothing();
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

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.guid) continue;

    // Compute diff against previous version
    let diffHtml: string | undefined;
    const rawChangelog = item.rawChangelog ?? item.contentText;

    if (rawChangelog) {
      const prevItem = items[i + 1];
      const prevText = prevItem?.rawChangelog ?? prevItem?.contentText;

      if (!prevText) {
        // Check existing entries for previous version
        const prevExisting = existingEntries.find((e) => e.version && e.version !== item.version);
        if (prevExisting?.rawChangelog) {
          diffHtml = computeDiffHtml(prevExisting.rawChangelog, rawChangelog);
        }
      } else {
        diffHtml = computeDiffHtml(prevText, rawChangelog);
      }
    }

    await db
      .insert(entries)
      .values({
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
      })
      .onConflictDoNothing();
  }
}
