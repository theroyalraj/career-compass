import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const tr = await prisma.trajectory.findFirst({
    where: { isActive: true },
    include: { milestones: { orderBy: { targetDate: "asc" } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Timeline"
        description="Milestones on your active trajectory — drag-and-drop editor comes in phase 2."
      />
      {!tr ? (
        <p className="text-muted-foreground">No active trajectory.</p>
      ) : (
        <div className="relative">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{tr.name}</h2>
            <Badge variant="outline">
              {format(tr.startDate, "MMM d, yyyy")} →{" "}
              {format(tr.targetDate, "MMM d, yyyy")}
            </Badge>
          </div>
          <div className="absolute left-4 top-14 bottom-0 w-px bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent md:left-6" />
          <ul className="space-y-6 pl-12 md:pl-16">
            {tr.milestones.map((m) => (
              <li key={m.id} className="relative">
                <span className="absolute -left-[1.35rem] top-1 flex h-3 w-3 rounded-full border-2 border-primary bg-background md:-left-[1.6rem]" />
                <div className="glass-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {m.category}
                    </Badge>
                    <Badge
                      variant={m.status === "done" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {m.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {format(m.targetDate, "MMM yyyy")}
                    </span>
                  </div>
                  <p className="mt-2 font-medium">{m.title}</p>
                  {m.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
