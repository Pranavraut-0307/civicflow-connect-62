import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="civic-gradient flex size-9 items-center justify-center rounded-xl shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 20h18" />
          <path d="M6 20V9l6-5 6 5v11" />
          <path d="M10 20v-5h4v5" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          Civil<span className="text-primary">Flow</span>
        </span>
      )}
    </Link>
  );
}
