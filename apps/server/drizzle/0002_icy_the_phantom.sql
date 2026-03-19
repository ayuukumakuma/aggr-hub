DELETE FROM "entries" WHERE "feed_id" IN (SELECT "id" FROM "feeds" WHERE "feed_type" = 'changelog');--> statement-breakpoint
DELETE FROM "feeds" WHERE "feed_type" = 'changelog';--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "feed_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "feed_type" SET DEFAULT 'rss'::text;--> statement-breakpoint
DROP TYPE "public"."feed_type";--> statement-breakpoint
CREATE TYPE "public"."feed_type" AS ENUM('rss', 'atom');--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "feed_type" SET DEFAULT 'rss'::"public"."feed_type";--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "feed_type" SET DATA TYPE "public"."feed_type" USING "feed_type"::"public"."feed_type";--> statement-breakpoint
ALTER TABLE "entries" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "entries" DROP COLUMN "diff_html";--> statement-breakpoint
ALTER TABLE "entries" DROP COLUMN "raw_changelog";