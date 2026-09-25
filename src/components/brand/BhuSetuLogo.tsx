import { cn } from "@/lib/utils";

/**
 * BhuSetu mark — a parcel polygon bridged by a spatial connection.
 * Geometric, single-weight, legible from 16px to 256px.
 */
export function BhuSetuMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="BhuSetu"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="bhu-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--teal)" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
      {/* parcel boundary */}
      <path
        d="M24 4 41 13.5v21L24 44 7 34.5v-21L24 4Z"
        fill="none"
        stroke="url(#bhu-mark)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* bridge / connection span */}
      <path
        d="M12 29c4.5-9 19.5-9 24 0"
        fill="none"
        stroke="var(--ivory)"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path d="M24 20.2V34" stroke="var(--saffron)" strokeWidth="1.5" strokeLinecap="round" />
      {/* spatial nodes */}
      <circle cx="12" cy="29" r="2.4" fill="var(--cyan)" />
      <circle cx="36" cy="29" r="2.4" fill="var(--cyan)" />
      <circle cx="24" cy="20.2" r="2.6" fill="var(--saffron)" />
    </svg>
  );
}

export function BhuSetuLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BhuSetuMark className={compact ? "h-7 w-7" : "h-9 w-9"} />
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-[1.0625rem] font-extrabold tracking-tight text-ivory">
            BHOO-MITRA <span className="text-primary">AI</span>
          </div>
          <div className="mt-1 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Urban Land Intelligence
          </div>
        </div>
      )}
    </div>
  );
}
