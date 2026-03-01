import { describe, it, vi } from 'vitest';

import { POST } from './[slug]/route';

vi.mock('@/libs/DB', () => ({
  db: {
    query: {
      eventTable: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(),
  },
}));

vi.mock('@/libs/resend', () => ({
  sendEmail: vi.fn(),
}));

const { db } = await import('@/libs/DB');
const { sendEmail } = await import('@/libs/resend');

function createRequest(body: unknown, ip?: string) {
  return new Request('http://localhost/api/contact/test-slug', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ip && { 'x-forwarded-for': ip }),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/contact/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue(undefined);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    } as never);
    vi.mocked(sendEmail).mockResolvedValue(true);
  });

  it('returns 404 when event not found', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue(undefined);

    const req = createRequest(
      {
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Question',
        message: 'Hello, I have a question about the event.',
      },
      '192.168.1.1',
    );
    const res = await POST(req, { params: Promise.resolve({ slug: 'nonexistent-404' }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Event not found');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 404 when contactEnabled is false', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue({
      id: 'evt-1',
      slug: 'contact-disabled',
      title: 'My Event',
      status: 'published',
      contactEnabled: false,
    } as never);

    const req = createRequest(
      {
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Question',
        message: 'Hello, I have a question about the event.',
      },
      '192.168.1.2',
    );
    const res = await POST(req, { params: Promise.resolve({ slug: 'contact-disabled' }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Event not found');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid body (missing name)', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue({
      id: 'evt-1',
      slug: 'bad-name',
      title: 'My Event',
      status: 'published',
      contactEnabled: true,
    } as never);

    const req = createRequest(
      {
        email: 'jane@example.com',
        subject: 'Question',
        message: 'Hello, I have a question.',
      },
      '192.168.1.3',
    );
    const res = await POST(req, { params: Promise.resolve({ slug: 'bad-name' }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid body (bad email)', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue({
      id: 'evt-1',
      slug: 'bad-email',
      title: 'My Event',
      status: 'published',
      contactEnabled: true,
    } as never);

    const req = createRequest(
      {
        name: 'Jane',
        email: 'not-an-email',
        subject: 'Question',
        message: 'Hello, I have a question about the event.',
      },
      '192.168.1.4',
    );
    const res = await POST(req, { params: Promise.resolve({ slug: 'bad-email' }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 500 when no host emails found', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue({
      id: 'evt-1',
      slug: 'no-hosts',
      title: 'My Event',
      status: 'published',
      contactEnabled: true,
    } as never);

    const rolesChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    };
    vi.mocked(db.select).mockReturnValue(rolesChain as never);

    const req = createRequest(
      {
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Question',
        message: 'Hello, I have a question about the event.',
      },
      '192.168.1.5',
    );
    const res = await POST(req, { params: Promise.resolve({ slug: 'no-hosts' }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('No host contact available');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns 200 and calls sendEmail with correct host emails on valid submission', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue({
      id: 'evt-1',
      slug: 'valid-submit',
      title: 'My Event',
      status: 'published',
      contactEnabled: true,
    } as never);

    const rolesChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { userId: 'user-1', invitedEmail: null },
        ]),
      }),
    };
    const usersChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ email: 'host@example.com' }]),
      }),
    };
    vi.mocked(db.select)
      .mockReturnValueOnce(rolesChain as never)
      .mockReturnValueOnce(usersChain as never);

    const req = createRequest(
      {
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Question',
        message: 'Hello, I have a question about the event.',
      },
      '192.168.1.6',
    );
    const res = await POST(req, { params: Promise.resolve({ slug: 'valid-submit' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['host@example.com'],
        subject: 'New message from Jane — My Event',
        replyTo: 'jane@example.com',
      }),
    );
  });

  it('returns 429 on rate limit breach', async () => {
    vi.mocked(db.query.eventTable.findFirst).mockResolvedValue({
      id: 'evt-1',
      slug: 'rate-limit-slug',
      title: 'My Event',
      status: 'published',
      contactEnabled: true,
    } as never);

    const rolesChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ userId: 'user-1', invitedEmail: null }]),
      }),
    };
    const usersChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ email: 'host@example.com' }]),
      }),
    };
    vi.mocked(db.select)
      .mockReturnValueOnce(rolesChain as never)
      .mockReturnValueOnce(usersChain as never)
      .mockReturnValueOnce(rolesChain as never)
      .mockReturnValueOnce(usersChain as never)
      .mockReturnValueOnce(rolesChain as never)
      .mockReturnValueOnce(usersChain as never)
      .mockReturnValueOnce(rolesChain as never)
      .mockReturnValueOnce(usersChain as never);

    const validBody = {
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Question',
      message: 'Hello, I have a question about the event.',
    };
    const ip = '192.168.1.1';

    for (let i = 0; i < 4; i++) {
      const req = createRequest(validBody, ip);
      const res = await POST(req, { params: Promise.resolve({ slug: 'rate-limit-slug' }) });
      if (i < 3) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(429);

        const data = await res.json();

        expect(data.error).toContain('Too many');
      }
    }
  });
});
