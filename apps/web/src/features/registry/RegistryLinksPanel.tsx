'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/Helpers';
import { getRegistryIcon } from '@/utils/registry-icons';

type RegistryLink = {
  id: string;
  event_id: string;
  display_name: string;
  url: string;
  domain: string;
  sort_order: number;
  created_at: string;
};

type RegistryLinksPanelProps = {
  eventId: string;
  registryEnabled: boolean;
};

const PRESETS = [
  { label: 'Amazon Wishlist', value: 'Amazon Wishlist' },
  { label: 'Walmart Wishlist', value: 'Walmart Wishlist' },
  { label: 'Target Registry', value: 'Target Registry' },
  { label: 'Best Buy Registry', value: 'Best Buy Registry' },
  { label: 'Etsy Wishlist', value: 'Etsy Wishlist' },
  { label: 'Baby Registry', value: 'Baby Registry' },
  { label: 'Custom...', value: '' },
] as const;

export function RegistryLinksPanel({ eventId, registryEnabled }: RegistryLinksPanelProps) {
  const t = useTranslations('Registry');
  const [links, setLinks] = useState<RegistryLink[]>([]);
  const [enabled, setEnabled] = useState(registryEnabled);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add form state
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESETS[0]!.value);
  const [customName, setCustomName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/registry`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleToggle(checked: boolean) {
    setEnabled(checked);
    await fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registry_enabled: checked }),
    });
  }

  async function handleCopy(link: RegistryLink) {
    await navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(linkId: string) {
    await fetch(`/api/events/${eventId}/registry/${linkId}`, {
      method: 'DELETE',
    });
    setLinks(prev => prev.filter(l => l.id !== linkId));
    setDeletingId(null);
  }

  async function handleAdd() {
    setAddError('');
    const displayName = selectedPreset || customName.trim();
    if (!displayName) {
      setAddError(t('error_name_required'));
      return;
    }
    if (!newUrl.trim()) {
      setAddError(t('error_url_required'));
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`/api/events/${eventId}/registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          url: newUrl.trim(),
          sort_order: links.length,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || t('error_add_failed'));
        return;
      }

      const newLink = await res.json();
      setLinks(prev => [...prev, newLink]);
      setNewUrl('');
      setSelectedPreset(PRESETS[0]!.value);
      setCustomName('');
    } catch {
      setAddError(t('error_add_failed'));
    } finally {
      setAdding(false);
    }
  }

  const displayName = selectedPreset || customName;

  return (
    <section
      aria-labelledby="registry-heading"
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <h2
          id="registry-heading"
          className="font-bricolage text-lg font-extrabold text-foreground"
        >
          {t('title')}
        </h2>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t('show_on_page')}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label={t('toggle_aria')}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-4 flex justify-center py-8">
          <div
            className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
            role="status"
            aria-label={t('loading')}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && links.length === 0 && (
        <p className="mt-4 font-nunito text-sm text-muted-foreground">
          {t('empty')}
        </p>
      )}

      {/* Link list */}
      {!loading && links.length > 0 && (
        <div className="mt-4 space-y-2" role="list" aria-label={t('links_list_aria')}>
          {links.map((link) => {
            const icon = getRegistryIcon(link.domain);
            const isDeleting = deletingId === link.id;

            return (
              <div
                key={link.id}
                role="listitem"
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
              >
                {isDeleting
                  ? (
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-nunito text-sm text-foreground">
                          {t('confirm_delete')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(link.id)}
                            className="min-h-[44px] rounded-[100px] bg-destructive px-4 font-nunito text-sm font-bold text-destructive-foreground outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                          >
                            {t('yes_delete')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="min-h-[44px] rounded-[100px] border border-border px-4 font-nunito text-sm font-semibold text-foreground outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    )
                  : (
                      <>
                        <span className="text-xl" aria-hidden="true">
                          {icon.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-nunito text-sm font-bold text-foreground">
                            {link.display_name}
                          </p>
                          <p className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                            {link.url}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(link)}
                            aria-label={t('copy_aria', { name: link.display_name })}
                            className={cn(
                              'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-sm outline-none transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]',
                              copiedId === link.id
                                ? 'text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {copiedId === link.id ? '✓' : '⧉'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(link.id)}
                            aria-label={t('delete_aria', { name: link.display_name })}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-sm text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add link form */}
      {!loading && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="registry-preset" className="sr-only">
                {t('preset_label')}
              </label>
              <select
                id="registry-preset"
                value={selectedPreset}
                onChange={(e) => {
                  setSelectedPreset(e.target.value);
                  if (e.target.value) {
                    setCustomName('');
                  }
                }}
                className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 font-nunito text-sm text-foreground outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                aria-label={t('preset_label')}
              >
                {PRESETS.map(p => (
                  <option key={p.label} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {!selectedPreset && (
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder={t('custom_name_placeholder')}
                  aria-label={t('custom_name_label')}
                  className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 font-nunito text-sm text-foreground outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                />
              )}
            </div>
            <div className="flex flex-1 gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://..."
                aria-label={t('url_label')}
                className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding || links.length >= 10 || !displayName || !newUrl.trim()}
                aria-label={t('add_button_aria')}
                className="min-h-[44px] shrink-0 rounded-[100px] bg-[rgb(81,255,0)] px-5 font-nunito text-sm font-bold text-[rgb(9,21,27)] outline-none transition-colors hover:bg-[rgb(65,204,0)] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? '...' : t('add_button')}
              </button>
            </div>
          </div>
          {addError && (
            <p className="font-nunito text-sm text-destructive" role="alert">
              {addError}
            </p>
          )}
          <p className="font-mono text-xs text-muted-foreground">
            {t('link_count', { current: links.length, max: 10 })}
          </p>
        </div>
      )}
    </section>
  );
}
