import type { Task } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { completeTask } from "@/lib/server-actions/task";
import { Check } from "lucide-react";

export function TodayFocus({ tasks }: { tasks: Task[] }) {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Today
          </p>
          <h3 className="text-lg font-semibold">Focus & overdue</h3>
        </div>
        <Link
          href="/tasks"
          className="text-xs font-medium text-secondary hover:underline"
        >
          Open board →
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <li className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-muted-foreground">
            Nothing due — add tasks from the Kanban.
          </li>
        ) : (
          tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 transition-colors hover:border-primary/20"
            >
              <form action={completeTask.bind(null, t.id)}>
                <button
                  type="submit"
                  className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  aria-label="Mark done"
                >
                  <Check className="h-4 w-4" />
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{t.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {t.priority}
                  </Badge>
                  {t.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
