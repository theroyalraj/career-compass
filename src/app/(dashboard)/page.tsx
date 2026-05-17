import { prisma } from "@/lib/db";
import { StatCard } from "@/components/dashboard/StatCard";
import { PivotProgress } from "@/components/dashboard/PivotProgress";
import { TodayFocus } from "@/components/dashboard/TodayFocus";
import { RunwaySpark } from "@/components/dashboard/RunwaySpark";
import { HabitHeatStrip } from "@/components/dashboard/HabitHeatStrip";
import { ActivityStrip } from "@/components/dashboard/ActivityStrip";
import { differenceInCalendarDays, startOfWeek, format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const [
    activeTrajectory,
    tasksDue,
    jobsThisWeek,
    touchCount30,
    habits,
    habitLogs,
    savings,
    transactions,
    recentJobs,
  ] = await Promise.all([
    prisma.trajectory.findFirst({
      where: { isActive: true },
      include: { milestones: true },
    }),
    prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: { lte: now },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 8,
    }),
    prisma.job.count({
      where: { appliedAt: { gte: weekStart } },
    }),
    prisma.touch.count({
      where: { date: { gte: new Date(now.getTime() - 30 * 86400000) } },
    }),
    prisma.habit.findMany({ where: { archived: false }, take: 8 }),
    prisma.habitLog.findMany({
      where: { date: { gte: new Date(now.getTime() - 14 * 86400000) } },
    }),
    prisma.savingsGoal.findFirst({ where: { name: { contains: "Runway" } } }),
    prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: 24,
    }),
    prisma.job.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const totalM = activeTrajectory?.milestones.length ?? 0;
  const doneM =
    activeTrajectory?.milestones.filter((m) => m.status === "done").length ?? 0;
  const pct = totalM ? Math.round((doneM / totalM) * 100) : 0;

  const daysToTarget = activeTrajectory
    ? Math.max(
        0,
        differenceInCalendarDays(activeTrajectory.targetDate, now),
      )
    : null;

  let flowChart = [...transactions]
    .reverse()
    .slice(0, 8)
    .map((t) => ({
      label: format(t.date, "MMM d"),
      flow:
        t.type === "expense"
          ? -Math.abs(t.amount) / 1000
          : Math.abs(t.amount) / 1000,
    }));

  if (flowChart.length === 0) {
    flowChart = [
      { label: "—", flow: 0 },
      { label: "…", flow: 0.5 },
      { label: "…", flow: -0.2 },
    ];
  }

  const expenseLast = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, t) => a + Math.abs(t.amount), 0);
  const incomeLast = transactions
    .filter((t) => t.type === "income")
    .reduce((a, t) => a + t.amount, 0);
  const burn = expenseLast > 0 ? expenseLast : 45000;
  const runwayMonths =
    incomeLast >= burn ? null : savings?.currentAmount
      ? Math.min(
          60,
          Math.max(0, savings.currentAmount / (burn - incomeLast || 1)),
        )
      : 4.2;

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl shadow-primary/5">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Career Compass
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Your pivot, orchestrated in one calm surface.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Trajectories, applications, habits, and runway — tuned for an EU Audio/ML
            move with glassy focus and keyboard-first flow.
          </p>
        </div>
      </div>

      {/* HIGHEST PRIORITY: MS IN SOUND AND MUSIC AI */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/50 bg-gradient-to-r from-primary/10 to-transparent p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
              <span className="animate-pulse text-2xl">🎓</span> 
              ULTIMATE GOAL: MS in Sound & Music AI (UPF Barcelona)
            </h3>
            <p className="text-sm text-foreground/80 max-w-2xl mt-2">
              <strong>Active Task:</strong> IELTS English Proficiency Certification. <br/>
              A comprehensive 63-video <em>IELTS Full Course (2023)</em> is downloading to your local workspace. This is the highest priority step towards your dream.
            </p>
          </div>
          <a href="/ielts-course" className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <span>▶</span> Continue Learning
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Days to target"
          value={daysToTarget != null ? String(daysToTarget) : "—"}
          deltaLabel={activeTrajectory?.name}
          icon="target"
        />
        <StatCard
          label="Applications this week"
          value={String(jobsThisWeek)}
          deltaLabel="since Monday"
          icon="briefcase"
        />
        <StatCard
          label="Outreach touches (30d)"
          value={String(touchCount30)}
          deltaLabel="CRM"
          icon="users"
        />
        <StatCard
          label="Runway (est. mo)"
          value={runwayMonths == null ? "∞" : runwayMonths.toFixed(1)}
          deltaLabel="from savings goal"
          icon="wallet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <TodayFocus tasks={tasksDue} />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <PivotProgress
            title={activeTrajectory?.name ?? "No active trajectory"}
            percent={pct}
            done={doneM}
            total={totalM}
          />
          <div className="glass-card">
            <p className="text-sm font-medium">Pipeline pulse</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {recentJobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span className="truncate font-medium text-foreground">
                    {j.company}
                  </span>
                  <span className="ml-2 shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                    {j.status.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RunwaySpark data={flowChart} />
        <HabitHeatStrip habits={habits} logs={habitLogs} />
      </div>

      <ActivityStrip jobs={recentJobs} />
    </div>
  );
}
