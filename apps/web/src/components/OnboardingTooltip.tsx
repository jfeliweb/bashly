'use client';

import { Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type OnboardingTooltipProps = {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

export function OnboardingTooltip({
  id,
  title,
  description,
  position = 'bottom',
}: OnboardingTooltipProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.localStorage.getItem(`tooltip-${id}-dismissed`) === 'true') {
      setDismissed(true);
    }
  }, [id]);

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`tooltip-${id}-dismissed`, 'true');
    }
  }

  if (dismissed) {
    return null;
  }

  const positionClasses = {
    bottom: 'top-full mt-2 left-0',
    top: 'bottom-full mb-2 left-0',
    left: 'right-full mr-2 top-0',
    right: 'left-full ml-2 top-0',
  };

  return (
    <div
      className={`absolute z-10 w-72 rounded-lg bg-cerulean-600 p-4 text-white shadow-lg ${positionClasses[position]}`}
      role="status"
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded text-white/80 hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-white/90">{description}</p>
        </div>
      </div>
    </div>
  );
}
