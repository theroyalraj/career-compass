"use client";

import { Progress } from "@/components/ui/progress";

export function PivotProgress({
  title,
  percent,
  done,
  total,
}: {
  title: string;
  percent: number;
  done: number;
  total: number;
}) {
  return (
    <div className="glass-card relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-500/20 blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active trajectory
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">{title}</p>
        </div>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold tabular-nums text-primary">
          {percent}%
        </span>
      </div>
      <div className="relative mt-6 flex flex-col items-center">
        <div
          className="relative flex h-36 w-36 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--primary)) ${percent * 3.6}deg, hsl(var(--muted)) 0deg)`,
          }}
        >
          <div className="flex h-[7.5rem] w-[7.5rem] flex-col items-center justify-center rounded-full bg-card">
            <span className="text-2xl font-bold tabular-nums">
              {done}/{total}
            </span>
            <span className="text-[11px] text-muted-foreground">milestones</span>
          </div>
        </div>
        <Progress value={percent} className="mt-6 h-2" />
      </div>
    </div>
  );
}
