ALTER TABLE "courses" ADD COLUMN "period" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "courses_professors" DROP COLUMN IF EXISTS "period";