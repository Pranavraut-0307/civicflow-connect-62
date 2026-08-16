import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Clock, CheckCircle2, Plus, MapPin, ArrowRight } from "lucide-react";
import { AppShell, PageHeading, citizenNav } from "@/components/civic/AppShell";
import { StatCard } from "@/components/civic/StatCard";
import { CityMap } from "@/components/civic/CityMap";
import { StatusBadge, CategoryBadge, PriorityBadge } from "@/components/civic/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CITIZEN_NAME, citizenComplaints, formatDate } from "@/lib/civic-data";

export const Route = createFileRoute("/citizen")({
  head: () => ({
    meta: [
      { title: "Citizen Dashboard — CivilFlow" },
      {
        name: "description",
        content:
          "Track your civic complaints, see pending and resolved reports, and report new issues in your ward.",
      },
      { property: "og:title", content: "Citizen Dashboard — CivilFlow" },
      {
        property: "og:description",
        content: "Your civic reports, statuses and neighbourhood issue map in one place.",
      },
    ],
  }),
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const total = citizenComplaints.length;
  const resolved = citizenComplaints.filter((c) => c.status === "resolved").length;
  const pending = total - resolved;

  return (
    <AppShell nav={citizenNav} role="Citizen" userName={CITIZEN_NAME}>
      <PageHeading
        title={`Welcome back, ${CITIZEN_NAME.split(" ")[0]}`}
        description="Here is the status of the civic issues you have reported across Nagpur."
        action={
          <Button asChild size="lg">
            <Link to="/report">
              <Plus /> Report an Issue
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total reports" value={total} icon={ClipboardList} hint="Since Feb 2026" />
        <StatCard
          label="Pending"
          value={pending}
          icon={Clock}
          tone="warning"
          hint="Awaiting resolution"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={CheckCircle2}
          tone="success"
          hint="Closed with proof"
        />
        <StatCard
          label="Avg. resolution"
          value="4.2 d"
          icon={MapPin}
          tone="info"
          hint="Your ward average"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="card-elevated">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent reports</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/track">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {citizenComplaints.map((c) => (
              <Link
                key={c.id}
                to="/complaint/$id"
                params={{ id: c.id }}
                className="block rounded-xl border p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {c.id}
                  </span>
                  <CategoryBadge category={c.category} />
                  <StatusBadge status={c.status} className="ml-auto" />
                </div>
                <p className="mt-2 font-medium">{c.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {c.location} · {formatDate(c.reportedAt)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Issues near you</CardTitle>
            </CardHeader>
            <CardContent>
              <CityMap items={citizenComplaints} className="h-64" showLegend={false} />
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/map">Open full map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Priority of open reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {citizenComplaints
                .filter((c) => c.status !== "resolved")
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{c.title}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
