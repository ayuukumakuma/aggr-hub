CREATE TYPE "public"."summary_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "summary_status" "summary_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
UPDATE "entries" SET "summary_status" = 'completed' WHERE "summary" IS NOT NULL;--> statement-breakpoint
UPDATE "entries" SET "summary_status" = 'failed' WHERE "summary" IS NULL;