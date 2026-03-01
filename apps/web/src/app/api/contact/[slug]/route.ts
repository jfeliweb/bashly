import { guestContactSchema } from '@saas/validators';
import { and, eq, inArray } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { createElement } from 'react';

import { GuestMessageEmail } from '@/emails/GuestMessageEmail';
import { db } from '@/libs/DB';
import { sendEmail } from '@/libs/resend';
import { userTable } from '@/models/AuthSchema';
import { eventRoleTable, eventTable } from '@/models/Schema';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/** In-memory rate limit: IP -> { eventSlug -> { count, resetAt } } */
const rateLimitMap = new Map<string, Map<string, { count: number; resetAt: number }>>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

function checkRateLimit(ip: string, eventSlug: string): boolean {
  const now = Date.now();
  let ipMap = rateLimitMap.get(ip);
  if (!ipMap) {
    ipMap = new Map();
    rateLimitMap.set(ip, ipMap);
  }

  let entry = ipMap.get(eventSlug);
  if (!entry) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipMap.set(eventSlug, entry);
  }

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  entry.count += 1;
  return entry.count <= RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  // Rate limit check
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, slug)) {
    return NextResponse.json(
      { error: 'Too many contact requests. Please try again later.' },
      { status: 429 },
    );
  }

  // 1. Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = guestContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // 2. Find event by slug — must be published and contact enabled
  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
  });

  if (!event || event.status !== 'published' || !event.contactEnabled) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 },
    );
  }

  // 3. Look up host emails (owner + co_host)
  const roles = await db
    .select({
      userId: eventRoleTable.userId,
      invitedEmail: eventRoleTable.invitedEmail,
    })
    .from(eventRoleTable)
    .where(
      and(
        eq(eventRoleTable.eventId, event.id),
        inArray(eventRoleTable.role, ['owner', 'co_host']),
      ),
    );

  const hostEmails: string[] = [];
  const userIds = roles.map(r => r.userId).filter((id): id is string => Boolean(id));
  const invitedEmails = roles.map(r => r.invitedEmail).filter((e): e is string => Boolean(e));

  if (userIds.length > 0) {
    const users = await db
      .select({ email: userTable.email })
      .from(userTable)
      .where(inArray(userTable.id, userIds));
    for (const u of users) {
      if (u.email) {
        hostEmails.push(u.email);
      }
    }
  }

  for (const email of invitedEmails) {
    if (email && !hostEmails.includes(email)) {
      hostEmails.push(email);
    }
  }

  // 4. No host emails
  if (hostEmails.length === 0) {
    return NextResponse.json(
      { error: 'No host contact available' },
      { status: 500 },
    );
  }

  // 5. Send email
  const subject = `New message from ${data.name} — ${event.title}`;
  const sent = await sendEmail({
    to: hostEmails,
    subject,
    react: createElement(GuestMessageEmail, {
      hostName: 'Host',
      guestName: data.name,
      guestEmail: data.email,
      subject: data.subject,
      message: data.message,
      eventTitle: event.title,
      eventId: event.id,
    }),
    replyTo: data.email,
  });

  if (!sent) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
