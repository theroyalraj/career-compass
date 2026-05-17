"use client";

import type { Task } from "@prisma/client";
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
import { moveTaskStatus } from "@/lib/server-actions/task";
import { toast } from "sonner";

const columns = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "Doing" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
] as const;

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    initialTasks,
    (state, u: { id: string; status: string }) =>
      state.map((t) => (t.id === u.id ? { ...t, status: u.status } : t)),
  );

  async function onMove(id: string, status: string) {
    start(async () => {
      setOptimistic({ id, status });
      try {
        await moveTaskStatus(id, status);
        toast.success("Task updated");
        router.refresh();
      } catch {
        toast.error("Could not update task");
      }
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => (
        <div key={col.id} className="glass-card min-h-[320px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {col.label}
            </h3>
            <span className="text-xs tabular-nums text-muted-foreground">
              {optimistic.filter((t) => t.status === col.id).length}
            </span>
          </div>
          <ul className="space-y-2">
            {optimistic
              .filter((t) => t.status === col.id)
              .map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <p className="font-medium leading-snug">{t.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {t.priority}
                    </Badge>
                  </div>
                  <Select
                    disabled={pending}
                    value={t.status}
                    onValueChange={(v) => onMove(t.id, v)}
                  >
                    <SelectTrigger className="mt-3 h-8 text-xs">
                      <SelectValue placeholder="Move" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
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
