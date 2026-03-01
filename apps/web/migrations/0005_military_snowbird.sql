ALTER TABLE "event" ADD COLUMN "contact_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "contact_form_visible" text DEFAULT 'always';--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "contact_phone" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "contact_phone_visible" text DEFAULT 'always';