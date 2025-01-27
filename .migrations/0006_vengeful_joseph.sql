ALTER TABLE "comments" ALTER COLUMN "body" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "rating" integer NOT NULL;