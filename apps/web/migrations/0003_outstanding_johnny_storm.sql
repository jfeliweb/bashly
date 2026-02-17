CREATE TABLE "playlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"streaming_connection_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"platform_playlist_id" text NOT NULL,
	"platform_playlist_url" text,
	"last_synced_at" timestamp with time zone,
	"track_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_suggestion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"rsvp_id" uuid,
	"itunes_track_id" text NOT NULL,
	"spotify_uri" text,
	"apple_music_id" text,
	"isrc" text,
	"track_title" text NOT NULL,
	"artist_name" text NOT NULL,
	"album_name" text,
	"album_art_url" text,
	"guest_message" text,
	"guest_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_suggestion_id" uuid NOT NULL,
	"rsvp_id" uuid,
	"fingerprint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "song_vote_suggestion_fingerprint_unique" UNIQUE("song_suggestion_id","fingerprint")
);
--> statement-breakpoint
CREATE TABLE "streaming_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"platform_user_id" text,
	"platform_display_name" text,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "streaming_connection_user_platform_unique" UNIQUE("user_id","platform")
);
--> statement-breakpoint
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_streaming_connection_id_streaming_connection_id_fk" FOREIGN KEY ("streaming_connection_id") REFERENCES "public"."streaming_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_suggestion" ADD CONSTRAINT "song_suggestion_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_suggestion" ADD CONSTRAINT "song_suggestion_rsvp_id_rsvp_id_fk" FOREIGN KEY ("rsvp_id") REFERENCES "public"."rsvp"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_vote" ADD CONSTRAINT "song_vote_song_suggestion_id_song_suggestion_id_fk" FOREIGN KEY ("song_suggestion_id") REFERENCES "public"."song_suggestion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_vote" ADD CONSTRAINT "song_vote_rsvp_id_rsvp_id_fk" FOREIGN KEY ("rsvp_id") REFERENCES "public"."rsvp"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaming_connection" ADD CONSTRAINT "streaming_connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;