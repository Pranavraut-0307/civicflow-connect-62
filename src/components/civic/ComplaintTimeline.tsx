import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META, formatDateTime, type TimelineEntry } from "@/lib/civic-data";

export function ComplaintTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-6">
      {entries.map((entry, i) => {
        const done = Boolean(entry.date);
        const isCurrent = done && !entries[i + 1]?.date;
        return (
          <li key={entry.status} className="relative flex gap-4 pl-1">
            {i < entries.length - 1 && (
              <span
                className={cn(
                  "absolute top-8 left-[15px] h-[calc(100%+0.5rem)] w-0.5 rounded",
                  done ? "bg-primary/40" : "bg-border",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
              {isCurrent && (
                <span className="animate-marker-ping absolute inset-0 rounded-full bg-primary/50" />
              )}
            </span>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{STATUS_META[entry.status].label}</p>
                {isCurrent && (
                  <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    Current stage
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                {entry.date ? formatDateTime(entry.date) : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
