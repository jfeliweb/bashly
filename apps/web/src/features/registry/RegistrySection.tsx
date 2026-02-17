import { asc, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { registryLinkTable } from '@/models/Schema';
import { getRegistryIcon } from '@/utils/registry-icons';

type RegistrySectionProps = {
  eventId: string;
  registryEnabled: boolean;
};

export async function RegistrySection({ eventId, registryEnabled }: RegistrySectionProps) {
  if (!registryEnabled) {
    return null;
  }

  const links = await db
    .select()
    .from(registryLinkTable)
    .where(eq(registryLinkTable.eventId, eventId))
    .orderBy(asc(registryLinkTable.sortOrder));

  if (links.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[520px] px-4 pb-6">
      <h2
        className="mb-3 font-bricolage text-lg font-extrabold"
        style={{ color: 'var(--theme-text)' }}
      >
        🎁 Gift Registry
      </h2>
      <div className="flex flex-col gap-3">
        {links.map((link) => {
          const icon = getRegistryIcon(link.domain);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${link.displayName} — opens in new tab`}
              className="flex items-center justify-between rounded-xl border px-4 py-3 outline-none transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
              style={{
                backgroundColor: 'var(--theme-surface-raised)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="text-xl">
                  {icon.emoji}
                </span>
                <span className="font-nunito font-semibold">{link.displayName}</span>
              </span>
              <span aria-hidden="true" className="text-sm opacity-60">
                ↗
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
