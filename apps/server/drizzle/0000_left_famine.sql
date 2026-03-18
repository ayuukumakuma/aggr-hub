CREATE TYPE "public"."feed_type" AS ENUM('rss', 'atom', 'changelog');--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_id" uuid NOT NULL,
	"title" text,
	"url" text,
	"content_html" text,
	"content_text" text,
	"author" text,
	"published_at" timestamp with time zone,
	"is_read" boolean DEFAULT false NOT NULL,
	"guid" text NOT NULL,
	"version" text,
	"diff_html" text,
	"raw_changelog" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entries_feed_guid_unique" UNIQUE("feed_id","guid")
);
--> statement-breakpoint
CREATE TABLE "feeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"site_url" text,
	"feed_type" "feed_type" DEFAULT 'rss' NOT NULL,
	"description" text,
	"icon_url" text,
	"last_fetched_at" timestamp with time zone,
	"fetch_interval_minutes" integer DEFAULT 60 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feeds_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;