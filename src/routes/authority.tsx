import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LayoutList,
  ArrowUpRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PageHeading, authorityNav } from "@/components/civic/AppShell";
import { StatCard } from "@/components/civic/StatCard";
import { CityMap } from "@/components/civic/CityMap";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/civic/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  STATUS_FLOW,
  STATUS_META,
  categoryBreakdown,
  complaints,
  formatDate,
  monthlyTrend,
  type IssueStatus,
} from "@/lib/civic-data";

export const Route = createFileRoute("/authority")({
  head: () => ({
    meta: [
      { title: "Authority Dashboard — CivilFlow" },
      {
        name: "description",
        content:
          "Municipal control room view: monitor, prioritise and resolve civic complaints across all wards.",
      },
      { property: "og:title", content: "Authority Dashboard — CivilFlow" },
      {
        property: "og:description",
        content: "Complaint queue, priority levels, ward map and resolution analytics for authorities.",
      },
    ],
  }),
  component: AuthorityDashboard,
});

function AuthorityDashboard() {
  const [filter, setFilter] = useState<IssueStatus | "all">("all");

  const total = complaints.length;
  const critical = complaints.filter((c) => c.priority === "critical").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const pending = total - resolved;
  const rows = complaints.filter((c) => filter === "all" || c.status === filter);

  return (
    <AppShell nav={authorityNav} role="Authority" userName="NMC Control Room">
      <PageHeading
        title="Municipal control room"
        description="Live complaint queue across Nagpur Municipal Corporation zones."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={total} icon={LayoutList} hint="Active window" />
        <StatCard
          label="Critical"
          value={critical}
          icon={AlertTriangle}
          tone="destructive"
          hint="Needs same-day action"
        />
        <StatCard label="Pending" value={pending} icon={Clock} tone="warning" hint="Open queue" />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={CheckCircle2}
          tone="success"
          hint="Closed this month"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reported vs resolved</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reported"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="var(--chart-4)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Complaints by category</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} interval={0} angle={-12} dy={8} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card className="card-elevated">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <CardTitle className="text-base">Complaint queue</CardTitle>
            <Select value={filter} onValueChange={(v) => setFilter(v as IssueStatus | "all")}>
              <SelectTrigger className="w-44" aria-label="Filter by status">
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
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="hidden lg:table-cell">Ward</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Reported</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-semibold">{c.id}</TableCell>
                    <TableCell>
                      <CategoryBadge category={c.category} />
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">{c.ward}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={c.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="hidden text-sm whitespace-nowrap sm:table-cell">
                      {formatDate(c.reportedAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/complaint/$id" params={{ id: c.id }}>
                          Manage <ArrowUpRight />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ward map view</CardTitle>
            </CardHeader>
            <CardContent>
              <CityMap items={rows} className="h-72" />
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/map">Open full map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Department load</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {Object.entries(
                complaints.reduce<Record<string, number>>((acc, c) => {
                  acc[c.department] = (acc[c.department] ?? 0) + 1;
                  return acc;
                }, {}),
              ).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between gap-3">
                  <span className="truncate text-muted-foreground">{dept}</span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
