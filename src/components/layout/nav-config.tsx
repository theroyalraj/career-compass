import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  ClipboardList,
  Coins,
  FileText,
  Flag,
  GitBranch,
  Globe2,
  GraduationCap,
  Home,
  Landmark,
  LineChart,
  Map,
  MessageSquare,
  Mic2,
  Plane,
  Radio,
  Route,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Target,
  Timer,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: typeof Home };

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Today",
    items: [
      { href: "/", label: "Dashboard", icon: Home },
      { href: "/sensei", label: "Sensei AI", icon: Sparkles },
      { href: "/routine", label: "Routine", icon: Timer },
      { href: "/habits", label: "Habits", icon: Activity },
      { href: "/tasks", label: "Tasks", icon: ClipboardList },
    ],
  },
  {
    label: "Plan",
    items: [
      { href: "/timeline", label: "Timeline", icon: GitBranch },
      { href: "/trajectories", label: "Trajectories", icon: Route },
      { href: "/roadmap", label: "Roadmap", icon: Map },
      { href: "/weekly", label: "Weekly", icon: Calendar },
      { href: "/monthly", label: "Monthly", icon: CalendarDays },
      { href: "/quarterly", label: "Quarterly", icon: LineChart },
      { href: "/annual", label: "Annual", icon: Flag },
    ],
  },
  {
    label: "Career",
    items: [
      { href: "/jobs", label: "Jobs", icon: Briefcase },
      { href: "/dream-list", label: "Dream list", icon: Star },
      { href: "/network", label: "Network", icon: Users },
      { href: "/outreach", label: "Outreach", icon: MessageSquare },
      { href: "/resume", label: "Resume", icon: FileText },
      { href: "/portfolio", label: "Portfolio", icon: Globe2 },
      { href: "/cover-letters", label: "Cover Letters", icon: StickyNote },
      { href: "/interview", label: "Interview Prep", icon: Mic2 },
      { href: "/interview/system-design", label: "System Design", icon: Sparkles },
      { href: "/interview/ml", label: "ML Drill", icon: GraduationCap },
      { href: "/interview/audio", label: "Audio Drill", icon: Radio },
      { href: "/interview/mocks", label: "Mock Interviews", icon: Target },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/learning", label: "Learning", icon: BookOpen },
      { href: "/projects", label: "Projects", icon: Globe2 },
      { href: "/blog", label: "Blog", icon: FileText },
      { href: "/reading", label: "Reading", icon: BookOpen },
      { href: "/events", label: "Events", icon: CalendarDays },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/finance", label: "Finance", icon: Wallet },
      { href: "/finance/income", label: "Income", icon: Coins },
      { href: "/finance/expenses", label: "Expenses", icon: Landmark },
      { href: "/finance/runway", label: "Runway", icon: LineChart },
      { href: "/fx", label: "FX", icon: ArrowRightLeft },
      { href: "/salary", label: "Salary", icon: BarChart3 },
      { href: "/col", label: "Cost of Living", icon: Globe2 },
    ],
  },
  {
    label: "Move",
    items: [
      { href: "/visa", label: "Visa", icon: Plane },
      { href: "/relocation", label: "Relocation", icon: Map },
      { href: "/barcelona", label: "Barcelona Plan", icon: Plane },
    ],
  },
  {
    label: "Other",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-6 px-2 py-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground shadow-inner shadow-primary/10"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        active
                          ? "text-primary"
                          : "text-muted-foreground group-hover:scale-110 group-hover:text-secondary",
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
