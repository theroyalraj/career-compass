import { prisma } from "@/lib/db";
import { OutreachClient } from "./OutreachClient";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const templates = await prisma.outreachTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Networking CRM
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Outreach Templates
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Quickly customize and copy high-conversion cold messages for researchers, recruiters, and engineers in the European audio-tech ecosystem.
          </p>
        </div>
      </div>

      <OutreachClient templates={templates} />
    </div>
  );
}
