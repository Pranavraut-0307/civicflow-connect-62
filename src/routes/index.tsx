import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  MapPinned,
  ShieldCheck,
  BellRing,
  ArrowRight,
  Building2,
  Users,
} from "lucide-react";
import heroImage from "@/assets/civic-hero.jpg";
import { Logo } from "@/components/civic/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_META, platformStats, type IssueCategory } from "@/lib/civic-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivilFlow — Report. Track. Improve." },
      {
        name: "description",
        content:
          "CivilFlow lets citizens report potholes, garbage, drainage and streetlight issues, and helps municipal authorities prioritise and resolve them faster.",
      },
      { property: "og:title", content: "CivilFlow — Report. Track. Improve." },
      {
        property: "og:description",
        content:
          "A civic issue reporting and monitoring platform for citizens and municipal authorities.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: Camera,
    title: "Capture the issue",
    body: "Snap a photo, pick a category and let GPS pin the exact spot on the map.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & routed",
    body: "Field officers verify the report and it is routed to the responsible department.",
  },
  {
    icon: BellRing,
    title: "Track every stage",
    body: "Follow your complaint from reported through assigned, in progress and resolved.",
  },
  {
    icon: MapPinned,
    title: "City-wide visibility",
    body: "Authorities see hotspots on a live ward map and prioritise the most critical work.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/map">Issue map</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/citizen">Citizen Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <img
          src={heroImage}
          alt="Aerial view of a city street grid at dusk with location markers"
          width={1600}
          height={1104}
          className="absolute inset-0 size-full object-cover opacity-95"
        />
        <div className="absolute inset-0 civic-gradient opacity-85" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div className="animate-rise text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur">
              Nagpur Municipal Corporation · Pilot
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Report. Track. Improve.
            </h1>
            <p className="mt-5 max-w-xl text-base/relaxed opacity-90 sm:text-lg/relaxed">
              CivilFlow connects citizens and municipal teams on one transparent
              platform — from the first photo of a pothole to a verified,
              closed-out repair.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/citizen">
                  <Users /> Citizen Login
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Link to="/authority">
                  <Building2 /> Authority Login
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs opacity-75">
              Prototype build — both logins open demo dashboards with sample data.
            </p>
          </div>

          <div className="animate-rise grid grid-cols-2 gap-3 self-center">
            {(Object.keys(CATEGORY_META) as IssueCategory[]).slice(0, 6).map((k) => (
              <div
                key={k}
                className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 text-primary-foreground backdrop-blur-sm"
              >
                <span className="text-2xl" aria-hidden="true">
                  {CATEGORY_META[k].icon}
                </span>
                <p className="mt-2 text-sm font-semibold">{CATEGORY_META[k].label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {[
            { label: "Issues reported", value: platformStats.totalReports.toLocaleString("en-IN") },
            { label: "Issues resolved", value: platformStats.resolvedReports.toLocaleString("en-IN") },
            { label: "Active citizens", value: platformStats.activeCitizens.toLocaleString("en-IN") },
            { label: "Avg. resolution", value: `${platformStats.avgResolutionDays} days` },
            { label: "Wards covered", value: platformStats.wardsCovered },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-primary tabular-nums">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">How CivilFlow works</h2>
          <p className="mt-3 text-muted-foreground">
            Four steps that turn a street-level complaint into accountable municipal
            action — with a visible trail at every stage.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Card key={step.title} className="card-elevated h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Split CTA */}
      <section className="border-t bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <Card className="card-elevated">
            <CardContent className="p-8">
              <Users className="size-6 text-primary" />
              <h3 className="mt-4 font-display text-2xl font-bold">For citizens</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Report an issue in under a minute, get a complaint ID and follow the
                repair timeline until it is closed.
              </p>
              <Button asChild className="mt-6">
                <Link to="/report">
                  Report an issue <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-8">
              <Building2 className="size-6 text-primary" />
              <h3 className="mt-4 font-display text-2xl font-bold">For authorities</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A prioritised queue, ward-level hotspot map and analytics so teams fix
                what matters most, first.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/authority">
                  Open control room <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6">
          <Logo />
          <p>CivilFlow · Prototype with demo data · Built for Nagpur</p>
        </div>
      </footer>
    </div>
  );
}
