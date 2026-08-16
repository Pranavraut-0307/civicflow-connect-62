import { cn } from "@/lib/utils";
import {
  PRIORITY_META,
  STATUS_META,
  CATEGORY_META,
  type IssueCategory,
  type IssueStatus,
  type Priority,
} from "@/lib/civic-data";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap";

export function StatusBadge({
  status,
  className,
}: {
  status: IssueStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return <span className={cn(base, meta.className, className)}>{meta.label}</span>;
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn(base, meta.className, className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: IssueCategory;
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span className={cn(base, "bg-secondary text-secondary-foreground", className)}>
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  );
}
