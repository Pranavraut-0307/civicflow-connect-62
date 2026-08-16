import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, ImagePlus, Send, Info } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeading, citizenNav } from "@/components/civic/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  AiAnalysisPlaceholder,
  DuplicateReportPlaceholder,
} from "@/components/civic/AiPlaceholders";
import { CATEGORY_META, CITIZEN_NAME, type IssueCategory } from "@/lib/civic-data";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Civic Issue — CivilFlow" },
      {
        name: "description",
        content:
          "Report potholes, garbage, drainage, streetlight and water leakage problems with a photo and location.",
      },
      { property: "og:title", content: "Report a Civic Issue — CivilFlow" },
      {
        property: "og:description",
        content: "Submit a civic complaint with photo evidence and GPS location in under a minute.",
      },
    ],
  }),
  component: ReportIssue,
});

function ReportIssue() {
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [location, setLocation] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    setLocating(true);
    // Prototype: real builds should call navigator.geolocation and reverse-geocode.
    setTimeout(() => {
      setLocation("21.1458, 79.0882 — Sitabuldi, Nagpur");
      setLocating(false);
      toast.success("Location captured", { description: "Detected near Sitabuldi, Nagpur." });
    }, 700);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Report submitted", {
      description: "Demo mode — your complaint would be filed as CF-2042.",
    });
  }

  return (
    <AppShell nav={citizenNav} role="Citizen" userName={CITIZEN_NAME}>
      <PageHeading
        title="Report an issue"
        description="Add a photo and precise location so the right department can act quickly."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base">Complaint details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category">Issue category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select the type of issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_META) as IssueCategory[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {CATEGORY_META[key].icon} {CATEGORY_META[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Upload image</Label>
                <label
                  htmlFor="photo"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 p-6 text-center transition-colors hover:bg-muted/70"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Selected issue photo preview"
                      className="max-h-52 rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <ImagePlus className="size-6 text-muted-foreground" />
                      <span className="text-sm font-medium">Tap to upload a photo</span>
                      <span className="text-xs text-muted-foreground">JPG or PNG, up to 10 MB</span>
                    </>
                  )}
                </label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Describe the problem, how long it has existed and who it affects…"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Street, landmark or area"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="shrink-0"
                  >
                    <Crosshair /> {locating ? "Locating…" : "Use my GPS"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Landmark helps field crews find the exact spot.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward / Zone (optional)</Label>
                <Input id="ward" placeholder="e.g. Ward 14 — Dharampeth Zone" />
              </div>

              <Button type="submit" size="lg" className="w-full">
                <Send /> Submit report
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4 text-primary" /> Before you submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>· Take the photo from a safe distance, facing the issue directly.</p>
              <p>· Include a nearby landmark in the description.</p>
              <p>· You will receive a complaint ID to track progress.</p>
            </CardContent>
          </Card>
          <AiAnalysisPlaceholder />
          <DuplicateReportPlaceholder />
        </div>
      </div>
    </AppShell>
  );
}
