'use client';

import { useState } from 'react';

type Props = { url: string };

export function CopyGuestUrl({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <p
        className="flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground"
        title={url}
      >
        {url}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
        aria-label={copied ? 'Copied!' : 'Copy guest page link'}
      >
        {copied ? '✓' : '⧉'}
      </button>
    </div>
  );
}
