import {
  bigint,
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { userTable } from './AuthSchema';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

const ts = { mode: 'date' as const, withTimezone: true };

export const eventTable = pgTable(
  'event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: text('owner_id').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    eventType: text('event_type').notNull(),
    description: text('description'),
    coverImageUrl: text('cover_image_url'),
    coverImageKey: text('cover_image_key'),
    themeId: text('theme_id').default('theme1'),
    eventDate: timestamp('event_date', ts),
    doorsOpenAt: timestamp('doors_open_at', ts),
    venueName: text('venue_name'),
    venueAddress: text('venue_address'),
    venueLat: decimal('venue_lat', { precision: 10, scale: 7 }),
    venueLng: decimal('venue_lng', { precision: 10, scale: 7 }),
    venueNotes: text('venue_notes'),
    dressCode: text('dress_code'),
    welcomeMessage: text('welcome_message'),
    maxCapacity: integer('max_capacity'),
    rsvpDeadline: timestamp('rsvp_deadline', ts),
    addressVisible: text('address_visible').default('after_rsvp'),
    contactEnabled: boolean('contact_enabled').default(false),
    contactFormVisible: text('contact_form_visible').default('always'),
    contactPhone: text('contact_phone'),
    contactPhoneVisible: text('contact_phone_visible').default('always'),
    songRequestsEnabled: boolean('song_requests_enabled').default(true),
    songRequestsPerGuest: integer('song_requests_per_guest').default(5),
    songVotingEnabled: boolean('song_voting_enabled').default(false),
    registryEnabled: boolean('registry_enabled').default(true),
    status: text('status').default('draft'),
    privateNotes: text('private_notes'),
    createdAt: timestamp('created_at', ts).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', ts)
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => ({
    slugIdx: uniqueIndex('event_slug_idx').on(table.slug),
  }),
);

export const scheduleItemTable = pgTable('schedule_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => eventTable.id, { onDelete: 'cascade' }),
  startTime: text('start_time').notNull(),
  title: text('title').notNull(),
  note: text('note'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', ts).defaultNow().notNull(),
});

export const eventRoleTable = pgTable('event_role', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => eventTable.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  role: text('role').notNull(),
  invitedEmail: text('invited_email'),
  createdAt: timestamp('created_at', ts).defaultNow().notNull(),
});

export const inviteTable = pgTable(
  'invite',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => eventTable.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    role: text('role').notNull(),
    maxUses: integer('max_uses'),
    useCount: integer('use_count').notNull().default(0),
    expiresAt: timestamp('expires_at', ts),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at', ts).defaultNow().notNull(),
  },
  table => ({
    codeIdx: uniqueIndex('invite_code_idx').on(table.code),
  }),
);

export const rsvpTable = pgTable('rsvp', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => eventTable.id, { onDelete: 'cascade' }),
  inviteCode: text('invite_code'),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  plusOnes: integer('plus_ones').notNull().default(0),
  dietaryRestrictions: text('dietary_restrictions'),
  status: text('status').notNull().default('attending'),
  fingerprint: text('fingerprint'),
  createdAt: timestamp('created_at', ts).defaultNow().notNull(),
});

export const registryLinkTable = pgTable('registry_link', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => eventTable.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  url: text('url').notNull(),
  domain: text('domain').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', ts).defaultNow().notNull(),
});

// --- Phase 2: Music ---

export const songSuggestionTable = pgTable('song_suggestion', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => eventTable.id, { onDelete: 'cascade' }),
  rsvpId: uuid('rsvp_id').references(() => rsvpTable.id),
  itunesTrackId: text('itunes_track_id').notNull(),
  spotifyUri: text('spotify_uri'),
  appleMusicId: text('apple_music_id'),
  isrc: text('isrc'),
  trackTitle: text('track_title').notNull(),
  artistName: text('artist_name').notNull(),
  albumName: text('album_name'),
  albumArtUrl: text('album_art_url'),
  guestMessage: text('guest_message'),
  guestName: text('guest_name'),
  fingerprint: text('fingerprint'),
  status: text('status').notNull().default('pending'),
  voteCount: integer('vote_count').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', ts).defaultNow().notNull(),
});

export const songVoteTable = pgTable(
  'song_vote',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    songSuggestionId: uuid('song_suggestion_id')
      .notNull()
      .references(() => songSuggestionTable.id, { onDelete: 'cascade' }),
    rsvpId: uuid('rsvp_id').references(() => rsvpTable.id),
    fingerprint: text('fingerprint'),
    createdAt: timestamp('created_at', ts).defaultNow().notNull(),
  },
  table => ({
    songSuggestionFingerprintUnique: unique('song_vote_suggestion_fingerprint_unique').on(
      table.songSuggestionId,
      table.fingerprint,
    ),
  }),
);

export const streamingConnectionTable = pgTable(
  'streaming_connection',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id),
    platform: text('platform').notNull(),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at', ts),
    platformUserId: text('platform_user_id'),
    platformDisplayName: text('platform_display_name'),
    connectedAt: timestamp('connected_at', ts).defaultNow().notNull(),
  },
  table => ({
    userPlatformUnique: unique('streaming_connection_user_platform_unique').on(
      table.userId,
      table.platform,
    ),
  }),
);

export const playlistTable = pgTable('playlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => eventTable.id, { onDelete: 'cascade' }),
  streamingConnectionId: uuid('streaming_connection_id')
    .notNull()
    .references(() => streamingConnectionTable.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  platformPlaylistId: text('platform_playlist_id').notNull(),
  platformPlaylistUrl: text('platform_playlist_url'),
  lastSyncedAt: timestamp('last_synced_at', ts),
  trackCount: integer('track_count').notNull().default(0),
  createdAt: timestamp('created_at', ts).defaultNow().notNull(),
});
