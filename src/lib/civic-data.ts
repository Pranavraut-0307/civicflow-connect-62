/**
 * CivilFlow mock data layer.
 *
 * Everything here is static demo data for the frontend prototype.
 * When a real backend is connected, replace these exports with API calls
 * (server functions) that return the same shapes.
 */

export type IssueCategory =
  | "pothole"
  | "road-damage"
  | "garbage"
  | "drainage"
  | "streetlight"
  | "water-leakage"
  | "other";

export type IssueStatus =
  | "reported"
  | "verified"
  | "assigned"
  | "in-progress"
  | "resolved";

export type Priority = "critical" | "high" | "medium" | "low";

export interface TimelineEntry {
  status: IssueStatus;
  date: string | null;
  note: string;
}

export interface Complaint {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  location: string;
  ward: string;
  lat: number;
  lng: number;
  reportedAt: string;
  updatedAt: string;
  status: IssueStatus;
  priority: Priority;
  reporter: string;
  department: string;
  imageQuery: string;
  upvotes: number;
  timeline: TimelineEntry[];
}

export const CATEGORY_META: Record<
  IssueCategory,
  { label: string; icon: string; tone: string }
> = {
  pothole: { label: "Pothole", icon: "🕳️", tone: "var(--chart-1)" },
  "road-damage": { label: "Road Damage", icon: "🚧", tone: "var(--chart-3)" },
  garbage: { label: "Garbage", icon: "🗑️", tone: "var(--chart-4)" },
  drainage: { label: "Drainage", icon: "🌊", tone: "var(--chart-2)" },
  streetlight: { label: "Broken Streetlight", icon: "💡", tone: "var(--chart-5)" },
  "water-leakage": { label: "Water Leakage", icon: "💧", tone: "var(--chart-2)" },
  other: { label: "Other", icon: "📌", tone: "var(--muted-foreground)" },
};

export const STATUS_FLOW: IssueStatus[] = [
  "reported",
  "verified",
  "assigned",
  "in-progress",
  "resolved",
];

export const STATUS_META: Record<
  IssueStatus,
  { label: string; className: string }
> = {
  reported: { label: "Reported", className: "bg-muted text-muted-foreground" },
  verified: { label: "Verified", className: "bg-info/15 text-info" },
  assigned: { label: "Assigned", className: "bg-primary/15 text-primary" },
  "in-progress": { label: "In Progress", className: "bg-warning/20 text-warning-foreground" },
  resolved: { label: "Resolved", className: "bg-success/15 text-success" },
};

export const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/15 text-destructive" },
  high: { label: "High", className: "bg-warning/25 text-warning-foreground" },
  medium: { label: "Medium", className: "bg-info/15 text-info" },
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
};

function buildTimeline(status: IssueStatus, base: string): TimelineEntry[] {
  const notes: Record<IssueStatus, string> = {
    reported: "Complaint submitted by citizen with photo evidence.",
    verified: "Field inspector confirmed the issue on site.",
    assigned: "Allocated to the responsible zonal department.",
    "in-progress": "Repair crew dispatched, work underway.",
    resolved: "Work completed and closure photo uploaded.",
  };
  const reachedIndex = STATUS_FLOW.indexOf(status);
  const start = new Date(base).getTime();
  return STATUS_FLOW.map((s, i) => ({
    status: s,
    date:
      i <= reachedIndex
        ? new Date(start + i * 36 * 3600 * 1000).toISOString()
        : null,
    note: notes[s],
  }));
}

const raw: Array<
  Omit<Complaint, "timeline" | "updatedAt"> & { updatedAt?: string }
> = [
  {
    id: "CF-2041",
    category: "pothole",
    title: "Deep pothole near Sitabuldi main crossing",
    description:
      "A large pothole roughly two feet wide has formed at the junction. Two-wheelers are swerving into oncoming traffic to avoid it, especially after rain when it fills with water.",
    location: "Sitabuldi Main Road, near Gandhi Putla",
    ward: "Ward 14 — Dharampeth Zone",
    lat: 21.1458,
    lng: 79.0882,
    reportedAt: "2026-08-09T08:20:00.000Z",
    status: "in-progress",
    priority: "critical",
    reporter: "Ananya Deshmukh",
    department: "Public Works Department",
    imageQuery: "pothole",
    upvotes: 48,
  },
  {
    id: "CF-2039",
    category: "garbage",
    title: "Garbage pile not collected for six days",
    description:
      "Community bin overflowing onto the footpath. Stray animals scatter waste across the lane every morning.",
    location: "Khamla Square, behind vegetable market",
    ward: "Ward 22 — Laxmi Nagar Zone",
    lat: 21.1105,
    lng: 79.0555,
    reportedAt: "2026-08-11T05:10:00.000Z",
    status: "assigned",
    priority: "high",
    reporter: "Rohit Kalbande",
    department: "Solid Waste Management",
    imageQuery: "garbage",
    upvotes: 31,
  },
  {
    id: "CF-2036",
    category: "streetlight",
    title: "Four streetlights dark on service road",
    description:
      "The entire stretch between the flyover ramp and the school gate is unlit after 8 PM. Residents report safety concerns.",
    location: "Wardha Road service lane, near Chhatrapati Square",
    ward: "Ward 31 — Nehru Nagar Zone",
    lat: 21.1195,
    lng: 79.0602,
    reportedAt: "2026-08-12T15:45:00.000Z",
    status: "verified",
    priority: "medium",
    reporter: "Sneha Patil",
    department: "Electrical Maintenance",
    imageQuery: "streetlight",
    upvotes: 17,
  },
  {
    id: "CF-2030",
    category: "drainage",
    title: "Blocked stormwater drain causing waterlogging",
    description:
      "Drain cover is broken and silt has blocked the channel. Half a foot of water stands on the road after every shower.",
    location: "Manish Nagar, near railway underpass",
    ward: "Ward 28 — Manish Nagar",
    lat: 21.0898,
    lng: 79.0489,
    reportedAt: "2026-08-05T11:05:00.000Z",
    status: "resolved",
    priority: "high",
    reporter: "Imran Sheikh",
    department: "Drainage & Sewerage",
    imageQuery: "drainage",
    upvotes: 62,
  },
  {
    id: "CF-2028",
    category: "water-leakage",
    title: "Continuous leak from main supply pipeline",
    description:
      "Water gushing from a joint in the pipeline since Tuesday. Significant potable water wastage every hour.",
    location: "Ramdaspeth, opposite Orange City Hospital",
    ward: "Ward 12 — Dhantoli Zone",
    lat: 21.1372,
    lng: 79.0724,
    reportedAt: "2026-08-13T06:30:00.000Z",
    status: "reported",
    priority: "critical",
    reporter: "Meera Joshi",
    department: "Water Supply (NMC)",
    imageQuery: "water leak",
    upvotes: 25,
  },
  {
    id: "CF-2024",
    category: "road-damage",
    title: "Road surface caved in after pipeline work",
    description:
      "Contractor left the trench poorly refilled. The surface has sunk about six inches across one lane.",
    location: "Pratap Nagar Square towards Trimurti Nagar",
    ward: "Ward 25 — Pratap Nagar",
    lat: 21.1218,
    lng: 79.0398,
    reportedAt: "2026-08-07T13:15:00.000Z",
    status: "in-progress",
    priority: "high",
    reporter: "Kunal Raut",
    department: "Public Works Department",
    imageQuery: "damaged road",
    upvotes: 39,
  },
  {
    id: "CF-2019",
    category: "pothole",
    title: "Cluster of potholes on approach road",
    description:
      "Around eight small-to-medium potholes across a 60 metre stretch. Auto-rickshaws slow to a crawl here.",
    location: "Kamptee Road, near Indora Square",
    ward: "Ward 5 — Mangalwari Zone",
    lat: 21.1789,
    lng: 79.1024,
    reportedAt: "2026-08-02T09:50:00.000Z",
    status: "resolved",
    priority: "medium",
    reporter: "Prakash Meshram",
    department: "Public Works Department",
    imageQuery: "pothole",
    upvotes: 54,
  },
  {
    id: "CF-2015",
    category: "garbage",
    title: "Construction debris dumped on public land",
    description:
      "An unidentified truck dumped debris on the open plot next to the park entrance late at night.",
    location: "Beside Ambazari Garden gate 2",
    ward: "Ward 18 — Ambazari",
    lat: 21.1273,
    lng: 79.0292,
    reportedAt: "2026-08-14T04:40:00.000Z",
    status: "reported",
    priority: "low",
    reporter: "Tanvi Bhosale",
    department: "Solid Waste Management",
    imageQuery: "debris",
    upvotes: 9,
  },
  {
    id: "CF-2011",
    category: "streetlight",
    title: "Streetlight pole tilted dangerously",
    description:
      "Pole is leaning over the footpath after the storm. Exposed wiring visible at the base.",
    location: "Sadar, near GPO Square",
    ward: "Ward 8 — Sadar",
    lat: 21.1601,
    lng: 79.0793,
    reportedAt: "2026-08-10T17:25:00.000Z",
    status: "assigned",
    priority: "critical",
    reporter: "Vikas Nandanwar",
    department: "Electrical Maintenance",
    imageQuery: "streetlight",
    upvotes: 44,
  },
  {
    id: "CF-2007",
    category: "drainage",
    title: "Open manhole without cover",
    description:
      "Manhole cover missing near the bus stop. Temporary branch placed by locals as a warning.",
    location: "Hingna Road, near T-Point bus stop",
    ward: "Ward 33 — Hingna",
    lat: 21.1042,
    lng: 79.0022,
    reportedAt: "2026-08-08T07:05:00.000Z",
    status: "verified",
    priority: "critical",
    reporter: "Shalini Gupta",
    department: "Drainage & Sewerage",
    imageQuery: "manhole",
    upvotes: 71,
  },
  {
    id: "CF-2003",
    category: "other",
    title: "Damaged footpath railing near school",
    description:
      "Railing bent and partly detached, leaving a sharp edge where children walk.",
    location: "Civil Lines, near Vidhan Bhavan",
    ward: "Ward 10 — Civil Lines",
    lat: 21.1521,
    lng: 79.0698,
    reportedAt: "2026-08-06T12:00:00.000Z",
    status: "in-progress",
    priority: "medium",
    reporter: "Aditya Chavan",
    department: "Public Works Department",
    imageQuery: "footpath",
    upvotes: 13,
  },
  {
    id: "CF-1998",
    category: "water-leakage",
    title: "Overflowing water tank at public tap",
    description:
      "Float valve broken, tank overflows through the day. Reported to the ward office twice earlier.",
    location: "Nandanvan, near community hall",
    ward: "Ward 20 — Nandanvan",
    lat: 21.1348,
    lng: 79.1198,
    reportedAt: "2026-07-31T10:15:00.000Z",
    status: "resolved",
    priority: "low",
    reporter: "Farah Khan",
    department: "Water Supply (NMC)",
    imageQuery: "water tank",
    upvotes: 22,
  },
];

export const complaints: Complaint[] = raw.map((c) => ({
  ...c,
  updatedAt: c.updatedAt ?? c.reportedAt,
  timeline: buildTimeline(c.status, c.reportedAt),
}));

export function getComplaint(id: string): Complaint | undefined {
  return complaints.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

/** Complaints belonging to the demo citizen account. */
export const CITIZEN_NAME = "Ananya Deshmukh";
export const citizenComplaints = complaints.slice(0, 6);

export const platformStats = {
  totalReports: 18432,
  resolvedReports: 15218,
  activeCitizens: 9640,
  avgResolutionDays: 4.2,
  wardsCovered: 38,
};

export const monthlyTrend = [
  { month: "Mar", reported: 820, resolved: 690 },
  { month: "Apr", reported: 940, resolved: 810 },
  { month: "May", reported: 1120, resolved: 905 },
  { month: "Jun", reported: 1340, resolved: 1180 },
  { month: "Jul", reported: 1210, resolved: 1145 },
  { month: "Aug", reported: 1395, resolved: 1002 },
];

export const categoryBreakdown = [
  { name: "Pothole", value: 412 },
  { name: "Garbage", value: 356 },
  { name: "Drainage", value: 268 },
  { name: "Streetlight", value: 224 },
  { name: "Water Leakage", value: 181 },
  { name: "Road Damage", value: 158 },
];

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
