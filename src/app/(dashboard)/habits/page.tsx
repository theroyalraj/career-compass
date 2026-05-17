import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { HabitHeatStrip } from "@/components/dashboard/HabitHeatStrip";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await prisma.habit.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
  });
  const logs = await prisma.habitLog.findMany({
    where: { date: { gte: new Date(Date.now() - 14 * 86400000) } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits"
        description="Cadence-aware streaks — heat strip shows the last two weeks across your stack."
      />
      <HabitHeatStrip habits={habits} logs={logs} />
    </div>
  );
}
