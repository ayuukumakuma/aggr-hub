import { describe, expect, test } from "vite-plus/test";
import { updateEntryPages } from "./useEntries.js";
import type { Entry, PaginatedEntries } from "../lib/api.js";

const baseEntry: Entry = {
  id: "entry-1",
  feedId: "feed-1",
  title: "Entry",
  url: null,
  contentHtml: null,
  contentText: null,
  author: null,
  publishedAt: null,
  isRead: false,
  isFavorite: false,
  isReadLater: false,
  guid: "entry-1",
  ogImageUrl: null,
  summary: null,
  detailedSummary: null,
  summaryStatus: "pending",
  createdAt: "2026-05-21T00:00:00.000Z",
};

function page(entries: Entry[]): PaginatedEntries {
  return {
    data: entries,
    nextCursor: null,
    hasMore: false,
  };
}

describe("updateEntryPages", () => {
  test("updates matching entries across all infinite-query pages", () => {
    const data = {
      pages: [page([{ ...baseEntry, id: "other-entry" }]), page([baseEntry])],
      pageParams: [undefined, "cursor-1"],
    };

    const updated = updateEntryPages(data, "entry-1", {
      isRead: true,
      isFavorite: true,
      isReadLater: true,
    });

    expect(updated?.pages[1]?.data[0]).toMatchObject({
      id: "entry-1",
      isRead: true,
      isFavorite: true,
      isReadLater: true,
    });
    expect(updated?.pages[0]?.data[0]).toMatchObject({
      id: "other-entry",
      isRead: false,
      isFavorite: false,
      isReadLater: false,
    });
  });

  test("leaves non-paginated entry data unchanged", () => {
    expect(updateEntryPages(baseEntry, "entry-1", { isRead: true })).toBe(baseEntry);
  });
});
