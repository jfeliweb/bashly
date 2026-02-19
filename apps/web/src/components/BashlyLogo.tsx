export function BashlyLogo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`font-heading text-2xl font-bold tracking-tight ${className}`}
      aria-label="Bashly"
    >
      <span className="text-fern-700 dark:text-fern-500">bash</span>
      <span className="text-cerulean-700 dark:text-cerulean-400">ly</span>
    </div>
  );
}

export function BashlyLogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bashly icon"
    >
      <rect width="32" height="32" rx="8" className="fill-cerulean-500" />
      <path
        d="M9 8h7a5 5 0 0 1 0 10h-7V8zm0 10h8a6 6 0 0 1 0 12H9V18z"
        className="fill-white"
      />
      <circle cx="24" cy="24" r="4" className="fill-fern-500" />
    </svg>
  );
}
