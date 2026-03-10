import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { auth } from '@/libs/auth';
import { Logo } from '@/templates/Logo';

type PageProps = { params: Promise<{ locale: string; code: string }> };

const hostRoles = ['co_host', 'coordinator', 'dj', 'vendor'];

function roleLabelKey(role: string): string {
  const key = `role_${role}`;
  const valid
    = key === 'role_co_host'
      || key === 'role_coordinator'
      || key === 'role_dj'
      || key === 'role_guest'
      || key === 'role_vip_guest'
      || key === 'role_vendor';
  return valid ? key : 'role_guest';
}

export default async function InviteClaimPage({ params }: PageProps) {
  const { code } = await params;
  const t = await getTranslations('InviteClaim');
  const baseUrl
    = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/invites/${code}`;

  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';

  const res = await fetch(apiUrl, {
    cache: 'no-store',
    headers: { cookie },
  });

  if (res.status === 404 || res.status === 410) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <Logo />
          <h1 className="mt-6 text-xl font-extrabold text-foreground">
            {t('error_invalid_or_expired')}
          </h1>
          <Button
            asChild
            className="mt-6 min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            <Link href="/">{t('go_to_bashly')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!res.ok) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <Logo />
          <h1 className="mt-6 text-xl font-extrabold text-foreground">
            {t('error_invalid_or_expired')}
          </h1>
          <Button
            asChild
            className="mt-6 min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            <Link href="/">{t('go_to_bashly')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const data = (await res.json()) as {
    event_id: string;
    role: string;
    event_slug: string;
    event_title?: string;
  };

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    const claimRes = await fetch(`${baseUrl}/api/invites/${code}/claim`, {
      method: 'POST',
      cache: 'no-store',
      headers: { cookie, 'Content-Type': 'application/json' },
    });

    if (claimRes.ok) {
      const { redirect: redirectPath } = (await claimRes.json()) as { redirect: string };
      redirect(redirectPath);
    }
  }

  const roleKey = roleLabelKey(data.role);
  const roleLabel = t(roleKey as 'role_co_host' | 'role_coordinator' | 'role_dj' | 'role_guest' | 'role_vip_guest' | 'role_vendor');
  const isHost = hostRoles.includes(data.role);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <Logo />
        <h1 className="mt-6 text-xl font-extrabold text-foreground">
          {data.event_title ?? 'Event'}
        </h1>
        <p className="mt-2 font-mono text-sm font-semibold uppercase tracking-widest text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
          {roleLabel}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {isHost
            ? (
                <Button
                  asChild
                  className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                >
                  <Link href={`/sign-in?invite=${code}&invite_role=${data.role}&redirect=${encodeURIComponent(`/invite/${code}`)}`}>
                    {t('sign_in_to_accept')}
                  </Link>
                </Button>
              )
            : (
                <Button
                  asChild
                  className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                >
                  <Link href={`/e/${data.event_slug}?invite=${code}&invite_role=${data.role}`}>{t('view_event')}</Link>
                </Button>
              )}
        </div>
      </div>
    </div>
  );
}
