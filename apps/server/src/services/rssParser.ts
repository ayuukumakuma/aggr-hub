import RssParser from "rss-parser";
import { delay, domainThrottler } from "../utils/domainThrottler.js";

type CustomItem = {
  "content:encoded"?: string;
  author?: string;
  "media:content"?: { $: { url?: string; medium?: string } };
  "media:thumbnail"?: { $: { url?: string } };
};

const parser = new RssParser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
    ],
  },
});

export interface ParsedFeedItem {
  title: string | undefined;
  url: string | undefined;
  contentHtml: string | undefined;
  contentText: string | undefined;
  author: string | undefined;
  publishedAt: Date | undefined;
  guid: string;
  imageUrl: string | undefined;
}

export interface ParsedFeed {
  title: string | undefined;
  siteUrl: string | undefined;
  description: string | undefined;
  items: ParsedFeedItem[];
}

export interface ParseRssResult {
  feed: ParsedFeed;
  etag: string | undefined;
  lastModified: string | undefined;
}

interface ConditionalHeaders {
  etag?: string | null;
  lastModified?: string | null;
}

function extractImageUrl(
  item: CustomItem & { enclosure?: { url?: string; type?: string } },
): string | undefined {
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }

  const mediaContent = item["media:content"];
  if (mediaContent?.$?.url) {
    return mediaContent.$.url;
  }

  const mediaThumbnail = item["media:thumbnail"];
  if (mediaThumbnail?.$?.url) {
    return mediaThumbnail.$.url;
  }

  return undefined;
}

const MAX_RETRIES = 3;
const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithRetry(
  url: string,
  conditionalHeaders: ConditionalHeaders,
): Promise<Response> {
  const headers: Record<string, string> = {
    "User-Agent": "aggr-hub/1.0 (RSS fetcher)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  };
  if (conditionalHeaders.etag) {
    headers["If-None-Match"] = conditionalHeaders.etag;
  }
  if (conditionalHeaders.lastModified) {
    headers["If-Modified-Since"] = conditionalHeaders.lastModified;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers,
    });

    if (res.ok || res.status === 304) return res;

    if ((res.status === 429 || res.status === 503) && attempt < MAX_RETRIES) {
      const retryAfter = Number.parseInt(res.headers.get("Retry-After") ?? "", 10);
      const delayMs = retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
      console.warn(
        `[rssParser] ${res.status} from ${url}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await delay(delayMs);
      continue;
    }

    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries`);
}

export async function parseRssFeed(
  url: string,
  conditionalHeaders: ConditionalHeaders = {},
): Promise<ParseRssResult | null> {
  const res = await domainThrottler.throttle(url, () => fetchWithRetry(url, conditionalHeaders));

  if (res.status === 304) return null;

  const xml = await res.text();
  const feed = await parser.parseString(xml);

  const items: ParsedFeedItem[] = (feed.items ?? []).map((item) => ({
    title: item.title,
    url: item.link,
    contentHtml: item["content:encoded"] ?? item.content,
    contentText: item.contentSnippet,
    author: item.creator ?? item.author,
    publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
    guid: item.guid ?? item.link ?? item.title ?? "",
    imageUrl: extractImageUrl(item as CustomItem & { enclosure?: { url?: string; type?: string } }),
  }));

  return {
    feed: {
      title: feed.title,
      siteUrl: feed.link,
      description: feed.description,
      items,
    },
    etag: res.headers.get("etag") ?? undefined,
    lastModified: res.headers.get("last-modified") ?? undefined,
  };
}
