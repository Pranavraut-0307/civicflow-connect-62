import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
}

export const citizenNav: NavItem[] = [
  { to: "/citizen", label: "Dashboard" },
  { to: "/report", label: "Report Issue" },
  { to: "/track", label: "Track Complaints" },
  { to: "/map", label: "Issue Map" },
];

export const authorityNav: NavItem[] = [
  { to: "/authority", label: "Overview" },
  { to: "/map", label: "Issue Map" },
  { to: "/track", label: "All Complaints" },
];

export function AppShell({
  children,
  nav,
  role,
  userName,
}: {
  children: ReactNode;
  nav: NavItem[];
  role: "Citizen" | "Authority";
  userName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-semibold">{userName}</p>
              <p className="text-xs text-muted-foreground">{role} account</p>
            </div>
            <span className="civic-gradient flex size-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">
              {userName.charAt(0)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t bg-card px-4 py-2 md:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-foreground" }}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6")}>
        {children}
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        CivilFlow · Prototype build with demo data · Nagpur Municipal Corporation
      </footer>
    </div>
  );
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-rise mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
