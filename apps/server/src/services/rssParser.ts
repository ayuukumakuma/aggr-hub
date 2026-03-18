import RssParser from "rss-parser";

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

function extractImageUrl(
  item: CustomItem & { enclosure?: { url?: string; type?: string } },
): string | undefined {
  // 1. enclosure (type=image/*)
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }

  // 2. media:content
  const mediaContent = item["media:content"];
  if (mediaContent?.$?.url) {
    return mediaContent.$.url;
  }

  // 3. media:thumbnail
  const mediaThumbnail = item["media:thumbnail"];
  if (mediaThumbnail?.$?.url) {
    return mediaThumbnail.$.url;
  }

  return undefined;
}

export async function parseRssFeed(url: string): Promise<ParsedFeed> {
  const feed = await parser.parseURL(url);

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
    title: feed.title,
    siteUrl: feed.link,
    description: feed.description,
    items,
  };
}
