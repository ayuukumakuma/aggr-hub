import { parseRssFeed } from "./rssParser.js";

export interface DetectedFeed {
  feedUrl: string;
  title: string | undefined;
  siteUrl: string | undefined;
  feedType: "rss" | "atom" | "github-releases";
  description: string | undefined;
}

export function tryGitHubReleasesAtomUrl(url: string): string | null {
  const match = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/releases(?:\/.*)?)?(?:\/)?$/,
  );
  if (!match) return null;
  const [, owner, repo] = match;
  return `https://github.com/${owner}/${repo}/releases.atom`;
}

export async function detectAndParseFeed(url: string): Promise<DetectedFeed> {
  // Reject CHANGELOG URLs
  if (/github\.com\/[^/]+\/[^/]+\/blob\/.+\/CHANGELOG/i.test(url)) {
    throw new Error(
      "CHANGELOG files are not supported. Use the repository's Releases page URL instead (e.g., https://github.com/owner/repo/releases).",
    );
  }

  // GitHub Releases shortcut: directly construct the .atom URL
  const githubAtomUrl = tryGitHubReleasesAtomUrl(url);
  if (githubAtomUrl) {
    const result = await parseRssFeed(githubAtomUrl);
    if (!result) throw new Error(`Failed to fetch feed from ${githubAtomUrl}`);
    const repoName = result.feed.title?.replace(/^Release notes from /, "");
    return {
      feedUrl: githubAtomUrl,
      title: repoName,
      siteUrl: result.feed.siteUrl,
      feedType: "github-releases",
      description: result.feed.description,
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
      const result = await parseRssFeed(feedUrl);
      if (!result) throw new Error(`Failed to fetch feed from ${feedUrl}`);
      return {
        feedUrl,
        title: result.feed.title,
        siteUrl: result.feed.siteUrl,
        feedType: linkMatch[1] === "atom" ? "atom" : "rss",
        description: result.feed.description,
      };
    }
    throw new Error(
      "No RSS/Atom feed found. Provide a direct feed URL or a page with feed autodiscovery.",
    );
  }

  // Assume XML feed
  const result = await parseRssFeed(url);
  if (!result) throw new Error(`Failed to fetch feed from ${url}`);
  const isAtom = body.includes("<feed") && body.includes('xmlns="http://www.w3.org/2005/Atom"');

  return {
    feedUrl: url,
    title: result.feed.title,
    siteUrl: result.feed.siteUrl,
    feedType: isAtom ? "atom" : "rss",
    description: result.feed.description,
  };
}
