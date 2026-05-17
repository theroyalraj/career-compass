import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkles } from "lucide-react";

export function ModulePlaceholder({
  title,
  description = "This module is wired to your local database. Extend it with forms and charts from PLAN.md.",
  emoji,
}: {
  title: string;
  description?: string;
  emoji?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader title={title} description={description} />
      <div className="glass-card relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
        <div className="relative flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20 text-3xl shadow-inner">
            {emoji ?? <Sparkles className="h-8 w-8 text-primary" />}
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            You are running <strong className="text-foreground">Career Compass</strong>{" "}
            — a calm, glassmorphism shell with Prisma-backed data. Ship the rest of this
            view when you are ready.
          </p>
        </div>
      </div>
    </div>
  );
}
