import { parseRssFeed } from "./rssParser.js";
import {
  isGitHubReleasesUrl,
  isChangelogMdUrl,
  parseGitHubReleases,
  parseChangelogMd,
} from "./changelogParser.js";

export interface DetectedFeed {
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
