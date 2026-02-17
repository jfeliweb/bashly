'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/Helpers';

type InviteRow = {
  id: string;
  eventId: string;
  code: string;
  role: string;
  maxUses: number | null;
  useCount: number;
  expiresAt: string | null;
  createdAt: string;
};

const INVITE_ROLES = [
  'co_host',
  'coordinator',
  'dj',
  'guest',
  'vip_guest',
  'vendor',
] as const;

type InviteRole = (typeof INVITE_ROLES)[number];

type InviteLinksPanelProps = {
  eventId: string;
  eventSlug: string;
};

function getInviteUrl(code: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/invite/${code}`;
  }
  return `/invite/${code}`;
}

function truncateUrl(url: string, maxLen: number): string {
  if (url.length <= maxLen) {
    return url;
  }
  return `${url.slice(0, maxLen - 3)}…`;
}

export function InviteLinksPanel({ eventId, eventSlug }: InviteLinksPanelProps) {
  const t = useTranslations('InviteLinks');
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRole, setNewRole] = useState<InviteRole>('guest');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newMaxUses, setNewMaxUses] = useState<string>('');
  const [newExpiresAt, setNewExpiresAt] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}/invites`);
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as InviteRow[];
    setInvites(data);
  }, [eventId]);

  useEffect(() => {
    fetchInvites().finally(() => setLoading(false));
  }, [fetchInvites]);

  const roleLabel = (role: string): string => {
    const key = `role_${role}`;
    const validKeys = [
      'role_co_host',
      'role_coordinator',
      'role_dj',
      'role_guest',
      'role_vip_guest',
      'role_vendor',
    ] as const;
    if (validKeys.includes(key as (typeof validKeys)[number])) {
      return t(key as (typeof validKeys)[number]);
    }
    return role;
  };

  const handleCopy = useCallback(async (invite: InviteRow) => {
    const url = getInviteUrl(invite.code);
    await navigator.clipboard.writeText(url);
  }, []);

  const handleDelete = useCallback(
    async (inviteId: string) => {
      if (confirmDeleteId !== inviteId) {
        setConfirmDeleteId(inviteId);
        return;
      }
      setDeletingId(inviteId);
      try {
        const res = await fetch(`/api/events/${eventId}/invites/${inviteId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setInvites(prev => prev.filter(i => i.id !== inviteId));
          setConfirmDeleteId(null);
        }
      } finally {
        setDeletingId(null);
      }
    },
    [eventId, confirmDeleteId],
  );

  const handleCreate = useCallback(async () => {
    setSubmitting(true);
    try {
      const body: {
        role: string;
        max_uses?: number;
        expires_at?: string;
        email?: string;
        message?: string;
      } = {
        role: newRole,
      };
      if (newMaxUses.trim()) {
        const n = Number.parseInt(newMaxUses, 10);
        if (!Number.isNaN(n) && n > 0) {
          body.max_uses = n;
        }
      }
      if (newExpiresAt.trim()) {
        const d = new Date(newExpiresAt);
        if (!Number.isNaN(d.getTime())) {
          body.expires_at = d.toISOString();
        }
      }
      if (newEmail.trim()) {
        body.email = newEmail.trim();
      }
      if (newMessage.trim()) {
        body.message = newMessage.trim();
      }
      const res = await fetch(`/api/events/${eventId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as { invite: InviteRow };
        setInvites(prev => [data.invite, ...prev]);
        setShowForm(false);
        setNewMaxUses('');
        setNewExpiresAt('');
        setNewEmail('');
        setNewMessage('');
      }
    } finally {
      setSubmitting(false);
    }
  }, [eventId, newRole, newMaxUses, newExpiresAt, newEmail, newMessage]);

  const downloadQr = useCallback(
    async (format: 'png' | 'svg') => {
      const res = await fetch(`/api/events/${eventId}/qr?format=${format}`);
      if (!res.ok) {
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventSlug}-qr.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [eventId, eventSlug],
  );

  const guestPageUrl
    = typeof window !== 'undefined'
      ? `${window.location.origin}/e/${eventSlug}`
      : `/e/${eventSlug}`;

  const roleBadgeClass: Record<string, string> = {
    co_host: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    coordinator: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    dj: 'border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400',
    guest: 'border-muted-foreground/50 bg-muted text-muted-foreground',
    vip_guest: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    vendor: 'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:text-slate-400',
  };

  if (loading) {
    return (
      <section
        className="rounded-xl border border-border bg-card p-4 shadow-sm"
        aria-labelledby="invites-heading"
      >
        <h2
          id="invites-heading"
          className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
        >
          {t('panel_title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-labelledby="invites-heading"
    >
      <div className="flex items-center justify-between">
        <h2
          id="invites-heading"
          className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
        >
          {t('panel_title')}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-[44px]"
          onClick={() => setShowForm(!showForm)}
          aria-label={t('new_invite')}
        >
          +
          {' '}
          {t('new_invite')}
        </Button>
      </div>

      <div role="list" aria-label="Invite links by role" className="mt-4">
        {invites.map((invite) => {
          const url = getInviteUrl(invite.code);
          const isConfirming = confirmDeleteId === invite.id;
          return (
            <div
              key={invite.id}
              role="listitem"
              className="flex flex-wrap items-center gap-2 border-b border-border py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'inline-flex rounded-[100px] border px-2.5 py-0.5 font-mono text-[0.4375rem] font-semibold uppercase tracking-widest',
                    roleBadgeClass[invite.role] ?? roleBadgeClass.guest,
                  )}
                >
                  {roleLabel(invite.role)}
                </span>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {truncateUrl(url, 36)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  onClick={() => handleCopy(invite)}
                  aria-label={t('copy_invite', { role: roleLabel(invite.role) })}
                >
                  ⧉
                </Button>
                {isConfirming
                  ? (
                      <span className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground">{t('confirm_delete')}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-[44px]"
                          onClick={() => handleDelete(invite.id)}
                          disabled={deletingId === invite.id}
                        >
                          {t('confirm')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-[44px]"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          {t('cancel')}
                        </Button>
                      </span>
                    )
                  : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                        onClick={() => handleDelete(invite.id)}
                        disabled={deletingId === invite.id}
                        aria-label={t('delete_invite', { role: roleLabel(invite.role) })}
                      >
                        ✕
                      </Button>
                    )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div>
            <label htmlFor="invite-role" className="mb-1 block text-sm font-medium">
              Role
            </label>
            <Select
              value={newRole}
              onValueChange={v => setNewRole(v as InviteRole)}
            >
              <SelectTrigger id="invite-role" className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITE_ROLES.map(r => (
                  <SelectItem key={r} value={r} className="min-h-[44px]">
                    {roleLabel(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="invite-email" className="mb-1 block text-sm font-medium">
              {t('email_label')}
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder={t('email_placeholder')}
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="min-h-[44px]"
              aria-label={t('email_aria')}
            />
          </div>
          <div>
            <label htmlFor="invite-message" className="mb-1 block text-sm font-medium">
              {t('message_label')}
            </label>
            <Textarea
              id="invite-message"
              placeholder={t('message_placeholder')}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              maxLength={500}
              rows={3}
              className="min-h-[44px]"
              aria-label={t('message_aria')}
            />
          </div>
          <div>
            <label htmlFor="invite-max-uses" className="mb-1 block text-sm font-medium">
              Max uses (optional)
            </label>
            <Input
              id="invite-max-uses"
              type="number"
              min={1}
              placeholder={t('max_uses_placeholder')}
              value={newMaxUses}
              onChange={e => setNewMaxUses(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="invite-expires" className="mb-1 block text-sm font-medium">
              Expiry date (optional)
            </label>
            <Input
              id="invite-expires"
              type="date"
              value={newExpiresAt}
              onChange={e => setNewExpiresAt(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="min-h-[44px]"
              onClick={() => setShowForm(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
              onClick={handleCreate}
              disabled={submitting}
            >
              {t('generate')}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 p-4">
        <p className="font-mono text-sm text-muted-foreground">
          {truncateUrl(guestPageUrl, 40)}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
            onClick={() => downloadQr('png')}
            aria-label={t('download_png')}
          >
            ↓ PNG
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-[44px]"
            onClick={() => downloadQr('svg')}
            aria-label={t('download_svg')}
          >
            SVG
          </Button>
        </div>
      </div>
    </section>
  );
}
