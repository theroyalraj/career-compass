import type { Job } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ActivityStrip({ jobs }: { jobs: Job[] }) {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent applications</h3>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
        >
          Jobs <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((j) => (
          <Link
            key={j.id}
            href={`/jobs/${j.id}`}
            className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <p className="font-semibold">{j.company}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.role}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-secondary">
              {j.status.replace(/_/g, " ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
