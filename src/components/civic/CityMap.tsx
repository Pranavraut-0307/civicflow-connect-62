import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type Complaint } from "@/lib/civic-data";

/**
 * Lightweight schematic map of Nagpur.
 *
 * Renders complaint markers positioned from their lat/lng inside a fixed
 * bounding box. This is a prototype stand-in: swapping in a real tile map
 * (Leaflet / Mapbox) later only requires replacing this component while
 * keeping the same props.
 */

const BOUNDS = { minLat: 21.07, maxLat: 21.195, minLng: 78.99, maxLng: 79.135 };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
}

export function CityMap({
  items,
  className,
  selectedId,
  onSelect,
  showLegend = true,
}: {
  items: Complaint[];
  className?: string | undefined;
  selectedId?: string | undefined;
  onSelect?: ((c: Complaint) => void) | undefined;
  showLegend?: boolean | undefined;
}) {
  const markers = useMemo(
    () => items.map((c) => ({ complaint: c, ...project(c.lat, c.lng) })),
    [items],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface",
        className,
      )}
      role="img"
      aria-label={`Schematic map of Nagpur showing ${items.length} reported issues`}
    >
      <div className="grid-pattern absolute inset-0" aria-hidden="true" />
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* lake / green belt */}
        <ellipse cx="24" cy="52" rx="11" ry="7" className="fill-accent/20" />
        <ellipse cx="76" cy="26" rx="8" ry="5" className="fill-success/15" />
        {/* arterial roads */}
        <g className="stroke-border" strokeWidth="1.1" fill="none">
          <path d="M0 46 L100 40" />
          <path d="M50 0 L46 100" />
          <path d="M0 78 L100 68" />
          <path d="M12 0 L30 100" />
          <path d="M78 0 L70 100" />
          <path d="M0 18 L100 22" />
        </g>
        <g className="stroke-primary/25" strokeWidth="1.8" fill="none">
          <path d="M8 92 C32 70, 40 50, 58 8" />
          <path d="M0 60 C30 58, 62 48, 100 52" />
        </g>
      </svg>

      <span className="absolute top-3 left-3 rounded-md bg-card/85 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur">
        Nagpur · Municipal Corporation
      </span>

      {markers.map(({ complaint, x, y }) => {
        const meta = CATEGORY_META[complaint.category];
        const active = selectedId === complaint.id;
        const isOpen = complaint.status !== "resolved";
        return (
          <button
            key={complaint.id}
            type="button"
            onClick={() => onSelect?.(complaint)}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`${complaint.id} — ${meta.label} · ${complaint.location}`}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card text-[13px] leading-none shadow-sm transition-transform duration-200 hover:z-20 hover:scale-125 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "z-20 scale-125 border-primary ring-2 ring-primary/40"
                : isOpen
                  ? "border-destructive/60"
                  : "border-success/70",
              "flex size-7 items-center justify-center",
            )}
          >
            <meta.icon className="size-3.5" aria-hidden="true" />
            {isOpen && complaint.priority === "critical" && (
              <span className="animate-marker-ping absolute inset-0 rounded-full bg-destructive/40" />
            )}
          </button>
        );
      })}

      {showLegend && (
        <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 rounded-lg border bg-card/90 p-2.5 text-[11px] backdrop-blur">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full border-2 border-destructive/60" />
            Open issue
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full border-2 border-success/70" />
            Resolved
          </span>
        </div>
      )}
    </div>
  );
}
