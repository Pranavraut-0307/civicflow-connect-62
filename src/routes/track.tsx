import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowUpRight } from "lucide-react";
import { AppShell, PageHeading, citizenNav } from "@/components/civic/AppShell";
import { ComplaintTimeline } from "@/components/civic/ComplaintTimeline";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/civic/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CATEGORY_META,
  CITIZEN_NAME,
  complaints,
  formatDate,
} from "@/lib/civic-data";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Complaints — CivilFlow" },
      {
        name: "description",
        content:
          "Look up a complaint ID and follow its progress from reported to verified, assigned, in progress and resolved.",
      },
      { property: "og:title", content: "Track Complaints — CivilFlow" },
      {
        property: "og:description",
        content: "Follow every civic complaint through its full resolution timeline.",
      },
    ],
  }),
  component: TrackComplaints,
});

function TrackComplaints() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(complaints[0]!.id);

  const filtered = complaints.filter((c) =>
    `${c.id} ${c.title} ${c.location} ${CATEGORY_META[c.category].label}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const selected = complaints.find((c) => c.id === selectedId) ?? complaints[0]!;

  return (
    <AppShell nav={citizenNav} role="Citizen" userName={CITIZEN_NAME}>
      <PageHeading
        title="Complaint tracking"
        description="Search by complaint ID, issue type or location to see the live resolution timeline."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="card-elevated">
          <CardHeader className="gap-3">
            <CardTitle className="text-base">All complaints</CardTitle>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search complaint ID, type or location…"
                className="pl-9"
                aria-label="Search complaints"
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint ID</TableHead>
                  <TableHead>Issue type</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden sm:table-cell">Reported</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    data-state={c.id === selectedId ? "selected" : undefined}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs font-semibold">{c.id}</TableCell>
                    <TableCell>
                      <CategoryBadge category={c.category} />
                    </TableCell>
                    <TableCell className="hidden max-w-[220px] truncate md:table-cell">
                      {c.location}
                    </TableCell>
                    <TableCell className="hidden text-sm whitespace-nowrap sm:table-cell">
                      {formatDate(c.reportedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No complaints match “{query}”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="card-elevated h-fit lg:sticky lg:top-24">
          <CardHeader className="gap-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-mono text-base">{selected.id}</CardTitle>
              <PriorityBadge priority={selected.priority} />
            </div>
            <p className="text-sm font-medium">{selected.title}</p>
            <dl className="grid gap-1.5 text-sm text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Issue type</dt>
                <dd className="text-foreground">{CATEGORY_META[selected.category].label}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Location</dt>
                <dd className="text-right text-foreground">{selected.location}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Date reported</dt>
                <dd className="text-foreground">{formatDate(selected.reportedAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Current status</dt>
                <dd>
                  <StatusBadge status={selected.status} />
                </dd>
              </div>
            </dl>
          </CardHeader>
          <CardContent className="space-y-5">
            <ComplaintTimeline entries={selected.timeline} />
            <Button asChild variant="outline" className="w-full">
              <Link to="/complaint/$id" params={{ id: selected.id }}>
                Full complaint details <ArrowUpRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
