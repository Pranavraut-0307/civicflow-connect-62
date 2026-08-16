import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ThumbsUp, User, Building2, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeading, authorityNav } from "@/components/civic/AppShell";
import { CityMap } from "@/components/civic/CityMap";
import { ComplaintTimeline } from "@/components/civic/ComplaintTimeline";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/civic/StatusBadge";
import {
  AiAnalysisPlaceholder,
  DuplicateReportPlaceholder,
  SeverityScorePlaceholder,
} from "@/components/civic/AiPlaceholders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_META,
  PRIORITY_META,
  STATUS_FLOW,
  STATUS_META,
  formatDateTime,
  getComplaint,
  type IssueStatus,
  type Priority,
} from "@/lib/civic-data";

export const Route = createFileRoute("/complaint/$id")({
  loader: ({ params }) => {
    const complaint = getComplaint(params.id);
    if (!complaint) throw notFound();
    return { complaint };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Complaint unavailable — CivilFlow" }, { name: "robots", content: "noindex" }],
      };
    }
    const { complaint } = loaderData;
    const title = `${complaint.id} · ${complaint.title} — CivilFlow`;
    return {
      meta: [
        { title },
        { name: "description", content: complaint.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: complaint.description.slice(0, 155) },
      ],
    };
  },
  component: ComplaintDetails,
});

function ComplaintDetails() {
  const { complaint } = Route.useLoaderData();
  const [status, setStatus] = useState<IssueStatus>(complaint.status);
  const [priority, setPriority] = useState<Priority>(complaint.priority);

  return (
    <AppShell nav={authorityNav} role="Authority" userName="NMC Control Room">
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link to="/authority">
          <ArrowLeft /> Back to complaints
        </Link>
      </Button>
      <PageHeading
        title={complaint.title}
        description={`Complaint ${complaint.id} · ${complaint.ward}`}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Complaint information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={complaint.category} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                  <ThumbsUp className="size-3.5" /> {complaint.upvotes} citizens affected
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {complaint.description}
              </p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Reported by</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <User className="size-4 text-muted-foreground" /> {complaint.reporter}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Assigned department</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <Building2 className="size-4 text-muted-foreground" /> {complaint.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reported on</dt>
                  <dd className="mt-0.5 font-medium">{formatDateTime(complaint.reportedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 font-medium">{CATEGORY_META[complaint.category].label}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-elevated overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Uploaded photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 text-center">
                  {(() => {
                    const Icon = CATEGORY_META[complaint.category].icon;
                    return <Icon className="size-8 text-muted-foreground" aria-hidden="true" />;
                  })()}
                  <p className="text-sm font-medium">Citizen photo evidence</p>
                  <p className="max-w-[220px] text-xs text-muted-foreground">
                    Demo placeholder — uploaded media will render here from storage.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CityMap items={[complaint]} className="h-40" showLegend={false} />
                <p className="text-sm font-medium">{complaint.location}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {complaint.lat.toFixed(4)}, {complaint.lng.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resolution timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintTimeline entries={complaint.timeline} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Update status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FLOW.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority level</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_META[p].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Internal note</Label>
                <Textarea id="note" rows={3} placeholder="Add an update for the audit trail…" />
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  toast.success("Status updated", {
                    description: `Demo mode — ${complaint.id} set to ${STATUS_META[status].label} / ${PRIORITY_META[priority].label}.`,
                  })
                }
              >
                <Save /> Save update
              </Button>
            </CardContent>
          </Card>

          <AiAnalysisPlaceholder />
          <SeverityScorePlaceholder />
          <DuplicateReportPlaceholder />
        </div>
      </div>
    </AppShell>
  );
}
