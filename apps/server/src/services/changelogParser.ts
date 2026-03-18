export interface ChangelogItem {
  title: string | undefined;
  url: string | undefined;
  contentText: string | undefined;
  author: string | undefined;
  publishedAt: Date | undefined;
  guid: string;
  version?: string;
  rawChangelog?: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  author: { login: string };
}

const GITHUB_RELEASES_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/?$/;

export function isGitHubReleasesUrl(url: string): boolean {
  return GITHUB_RELEASES_RE.test(url);
}

export function isChangelogMdUrl(url: string): boolean {
  return /\.md(\?.*)?$/i.test(url);
}

export async function parseGitHubReleases(
  url: string,
): Promise<{ title: string; siteUrl: string; items: ChangelogItem[] }> {
  const match = url.match(GITHUB_RELEASES_RE);
  if (!match) throw new Error("Invalid GitHub Releases URL");

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;

  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "aggr-hub",
    },
  });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const releases: GitHubRelease[] = await res.json();

  const items: ChangelogItem[] = releases.map((r) => ({
    title: r.name || r.tag_name,
    url: r.html_url,
    contentText: r.body,
    author: r.author.login,
    publishedAt: new Date(r.published_at),
    guid: String(r.id),
    version: r.tag_name,
    rawChangelog: r.body,
  }));

  return {
    title: `${owner}/${repo} Releases`,
    siteUrl: `https://github.com/${owner}/${repo}`,
    items,
  };
}

const GITHUB_BLOB_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;

function toRawUrl(url: string): string {
  const match = url.match(GITHUB_BLOB_RE);
  if (match) {
    const [, owner, repo, rest] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${rest}`;
  }
  return url;
}

function extractNameFromChangelogUrl(url: string): string {
  try {
    const u = new URL(url);
    const pathMatch = u.pathname.match(/^\/([^/]+)\/([^/]+)\//);
    if ((u.hostname === "raw.githubusercontent.com" || u.hostname === "github.com") && pathMatch) {
      return `${pathMatch[1]}/${pathMatch[2]}`;
    }
    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return segments[segments.length - 2];
    }
  } catch {}
  return "CHANGELOG";
}

export async function parseChangelogMd(
  url: string,
): Promise<{ title: string; items: ChangelogItem[] }> {
  const rawUrl = toRawUrl(url);
  const res = await fetch(rawUrl);
  if (!res.ok) throw new Error(`Failed to fetch changelog: ${res.status}`);

  const text = await res.text();

  interface RawSection {
    version: string;
    date: string | null;
    content: string[];
  }

  const rawSections: RawSection[] = [];
  const lines = text.split("\n");
  let currentVersion: string | null = null;
  let currentDate: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const match = line.match(/^##\s+\[?([^\]\s]+)\]?(?:\s*[-–]\s*(.+))?$/);
    if (match) {
      if (currentVersion) {
        rawSections.push({ version: currentVersion, date: currentDate, content: currentContent });
      }
      currentVersion = match[1];
      currentDate = match[2] ?? null;
      currentContent = [];
    } else if (currentVersion) {
      currentContent.push(line);
    }
  }

  if (currentVersion) {
    rawSections.push({ version: currentVersion, date: currentDate, content: currentContent });
  }

  // CHANGELOG.md lists newest first. When dates are missing, assign synthetic
  // timestamps based on section order so DB ordering stays consistent.
  const now = Date.now();
  const sections: ChangelogItem[] = rawSections.map((s, i) => ({
    title: s.version,
    url: url,
    contentText: s.content.join("\n").trim(),
    author: undefined,
    publishedAt: s.date ? new Date(s.date) : new Date(now - i * 1000),
    guid: s.version,
  }));

  return {
    title: extractNameFromChangelogUrl(url),
    items: sections,
  };
}
