import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

export const feedTypeEnum = pgEnum("feed_type", ["rss", "atom", "github-releases"]);
export const summaryStatusEnum = pgEnum("summary_status", [
  "pending",
  "completed",
  "failed",
  "skipped",
]);

export const feeds = pgTable("feeds", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title"),
  siteUrl: text("site_url"),
  feedType: feedTypeEnum("feed_type").notNull().default("rss"),
  description: text("description"),
  iconUrl: text("icon_url"),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  lastEtag: text("last_etag"),
  lastModified: text("last_modified"),
  fetchIntervalMinutes: integer("fetch_interval_minutes").notNull().default(60),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    feedId: uuid("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
    title: text("title"),
    url: text("url"),
    contentHtml: text("content_html"),
    contentText: text("content_text"),
    author: text("author"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    isRead: boolean("is_read").notNull().default(false),
    isFavorite: boolean("is_favorite").notNull().default(false),
    guid: text("guid").notNull(),
    ogImageUrl: text("og_image_url"),
    summary: text("summary"),
    detailedSummary: text("detailed_summary"),
    summaryStatus: summaryStatusEnum("summary_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("entries_feed_guid_unique").on(table.feedId, table.guid)],
);
