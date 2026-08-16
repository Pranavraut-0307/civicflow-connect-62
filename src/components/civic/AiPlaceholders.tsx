import { Bot, Copy, Gauge, PlugZap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

/**
 * Placeholder surfaces for future backend/AI integrations.
 *
 * None of these compute anything — they render "not connected" states with the
 * exact slots that a real API response will fill:
 *   - AiAnalysisPlaceholder      -> POST /api/analysis  (vision model output)
 *   - SeverityScorePlaceholder   -> severity score 0-100 + contributing factors
 *   - DuplicateReportPlaceholder -> list of candidate duplicate complaint IDs
 */

function NotConnected({ endpoint }: { endpoint: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
      <PlugZap className="mt-0.5 size-4 shrink-0" />
      <span>
        Not connected yet. This panel will render live results from{" "}
        <code className="rounded bg-background px-1 py-0.5 font-mono">{endpoint}</code>{" "}
        once the backend service is wired up.
      </span>
    </div>
  );
}

export function AiAnalysisPlaceholder() {
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="size-4 text-primary" />
          AI Image Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="grid gap-2 text-sm">
          {[
            "Detected issue type",
            "Detection confidence",
            "Affected area estimate",
            "Recommended department",
          ].map((label) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="h-4 w-24 animate-pulse rounded bg-muted" aria-label="awaiting data" />
            </div>
          ))}
        </dl>
        <Separator />
        <NotConnected endpoint="/api/ai/analyze-image" />
      </CardContent>
    </Card>
  );
}

export function SeverityScorePlaceholder() {
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="size-4 text-warning-foreground" />
          Severity Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-muted-foreground/50">—</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <Progress value={0} className="h-2" />
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>Inputs: hazard type, size estimate, footfall, repeat reports, weather</li>
          <li>Output: score, priority suggestion, SLA target</li>
        </ul>
        <NotConnected endpoint="/api/ai/severity-score" />
      </CardContent>
    </Card>
  );
}

export function DuplicateReportPlaceholder() {
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Copy className="size-4 text-info" />
          Duplicate Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Awaiting similarity check across nearby complaints (geo radius + image
          embedding + text match).
        </div>
        <NotConnected endpoint="/api/ai/duplicate-check" />
      </CardContent>
    </Card>
  );
}
