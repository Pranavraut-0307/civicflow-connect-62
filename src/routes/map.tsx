import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowUpRight, Filter } from "lucide-react";
import { AppShell, PageHeading, citizenNav } from "@/components/civic/AppShell";
import { CityMap } from "@/components/civic/CityMap";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/civic/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_META,
  CITIZEN_NAME,
  STATUS_FLOW,
  STATUS_META,
  complaints,
  formatDate,
  type IssueCategory,
  type IssueStatus,
} from "@/lib/civic-data";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Nagpur Issue Map — CivilFlow" },
      {
        name: "description",
        content:
          "Explore reported civic issues across Nagpur on an interactive map with category, status and location filters.",
      },
      { property: "og:title", content: "Nagpur Issue Map — CivilFlow" },
      {
        property: "og:description",
        content: "See where potholes, garbage, drainage and streetlight issues are reported city-wide.",
      },
    ],
  }),
  component: IssueMapPage,
});

function IssueMapPage() {
  const [category, setCategory] = useState<IssueCategory | "all">("all");
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const filtered = useMemo(
    () =>
      complaints.filter(
        (c) =>
          (category === "all" || c.category === category) &&
          (status === "all" || c.status === status) &&
          `${c.location} ${c.ward} ${c.title}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, status, query],
  );

  return (
    <AppShell nav={citizenNav} role="Citizen" userName={CITIZEN_NAME}>
      <PageHeading
        title="Interactive issue map"
        description="Every reported issue across Nagpur's 38 wards, filtered by category and status."
      />

      <Card className="card-elevated mb-6">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="search-location">Search location</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sitabuldi, Khamla, Wardha Road…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-category">Filter by category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory | "all")}>
              <SelectTrigger id="filter-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(Object.keys(CATEGORY_META) as IssueCategory[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {CATEGORY_META[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-status">Filter by status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus | "all")}>
              <SelectTrigger id="filter-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_FLOW.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <CityMap
          items={filtered}
          selectedId={selectedId}
          onSelect={(c) => setSelectedId(c.id)}
          className="h-[420px] lg:h-[620px]"
        />

        <Card className="card-elevated">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="size-4" /> {filtered.length} issues
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[540px] space-y-3 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors hover:bg-secondary/50 ${
                  selectedId === c.id ? "border-primary bg-secondary/60" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {c.id}
                  </span>
                  <StatusBadge status={c.status} className="ml-auto" />
                </div>
                <p className="mt-2 text-sm font-medium">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.location} · {formatDate(c.reportedAt)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <CategoryBadge category={c.category} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <Link
                  to="/complaint/$id"
                  params={{ id: c.id }}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open details <ArrowUpRight className="size-3.5" />
                </Link>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No issues match these filters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
