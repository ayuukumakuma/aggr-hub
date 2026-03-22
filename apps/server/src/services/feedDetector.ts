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
    const parsed = await parseRssFeed(githubAtomUrl);
    const repoName = parsed.title?.replace(/^Release notes from /, "");
    return {
      feedUrl: githubAtomUrl,
      title: repoName,
      siteUrl: parsed.siteUrl,
      feedType: "github-releases",
      description: parsed.description,
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
