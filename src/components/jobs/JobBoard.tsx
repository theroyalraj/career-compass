"use client";

import type { Job } from "@prisma/client";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moveJobStatus } from "@/lib/server-actions/job";
import { toast } from "sonner";
import Link from "next/link";
import { Building2 } from "lucide-react";

function label(s: string) {
  return s.replace(/_/g, " ");
}

export function JobBoard({
  initialJobs,
  statuses,
}: {
  initialJobs: Job[];
  statuses: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    initialJobs,
    (state, u: { id: string; status: string }) =>
      state.map((j) => (j.id === u.id ? { ...j, status: u.status } : j)),
  );

  function onMove(id: string, status: string) {
    start(async () => {
      setOptimistic({ id, status });
      try {
        await moveJobStatus(id, status);
        toast.success("Pipeline updated");
        router.refresh();
      } catch {
        toast.error("Update failed");
      }
    });
  }

  const displayStatuses = statuses.slice(0, 6);

  return (
    <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {displayStatuses.map((st) => (
        <div key={st} className="glass-card min-h-[280px]">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label(st)}
          </h3>
          <ul className="space-y-2">
            {optimistic
              .filter((j) => j.status === st)
              .map((j) => (
                <li
                  key={j.id}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <Link
                    href={`/jobs/${j.id}`}
                    className="flex items-start gap-2 font-medium hover:text-primary"
                  >
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="leading-snug">{j.company}</span>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {j.role}
                  </p>
                  {j.band && (
                    <Badge className="mt-2 text-[10px]" variant="secondary">
                      Band {j.band}
                    </Badge>
                  )}
                  <Select
                    disabled={pending}
                    value={j.status}
                    onValueChange={(v) => onMove(j.id, v)}
                  >
                    <SelectTrigger className="mt-2 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {label(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
