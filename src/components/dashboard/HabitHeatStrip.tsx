"use client";

import type { Habit, HabitLog } from "@prisma/client";
import { format, eachDayOfInterval, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export function HabitHeatStrip({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: HabitLog[];
}) {
  const days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date(),
  });

  const logKey = (habitId: string, d: Date) =>
    `${habitId}-${format(d, "yyyy-MM-dd")}`;
  const doneSet = new Set(
    logs
      .filter((l) => l.done)
      .map((l) => `${l.habitId}-${format(new Date(l.date), "yyyy-MM-dd")}`),
  );

  return (
    <div className="glass-card overflow-x-auto">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Habits · 14 days
      </p>
      <h3 className="text-lg font-semibold">Consistency strip</h3>
      <div className="mt-4 space-y-2">
        {habits.map((h) => (
          <div key={h.id} className="flex items-center gap-2">
            <span className="w-36 shrink-0 truncate text-xs text-muted-foreground">
              {h.emoji} {h.name}
            </span>
            <div className="flex flex-1 gap-0.5">
              {days.map((d) => {
                const on = doneSet.has(logKey(h.id, d));
                return (
                  <div
                    key={d.toISOString()}
                    title={format(d, "MMM d")}
                    className={cn(
                      "h-6 flex-1 rounded-sm transition-colors",
                      on ? "bg-primary shadow-sm shadow-primary/30" : "bg-muted/40",
                    )}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
