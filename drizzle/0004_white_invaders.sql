DROP TABLE "chat_message" CASCADE;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "messages" text DEFAULT '[]' NOT NULL;