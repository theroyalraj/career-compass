import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function TrajectoriesPage() {
  const trajectories = await prisma.trajectory.findMany({
    include: { milestones: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trajectories"
        description="Switch between aggressive and steady paths — active route powers your timeline."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {trajectories.map((t) => {
          const total = t.milestones.length;
          const done = t.milestones.filter((m) => m.status === "done").length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <div
              key={t.id}
              className="glass-card relative overflow-hidden"
              style={{
                borderColor: `${t.color}33`,
              }}
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
                style={{ background: t.color }}
              />
              <div className="relative flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(t.startDate, "MMM yyyy")} →{" "}
                    {format(t.targetDate, "MMM yyyy")}
                  </p>
                </div>
                {t.isActive && (
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    Active
                  </Badge>
                )}
              </div>
              <div className="relative mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${t.color}, hsl(var(--secondary)))`,
                    }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <p className="relative mt-3 text-xs text-muted-foreground">
                {done}/{total} milestones complete
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
