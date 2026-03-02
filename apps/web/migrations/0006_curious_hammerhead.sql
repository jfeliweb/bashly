ALTER TABLE "event" ADD COLUMN "payment_status" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "stripe_payment_intent_id" text;