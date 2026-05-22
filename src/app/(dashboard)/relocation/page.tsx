import { prisma } from "@/lib/db";
import { RelocationChecklistClient } from "./RelocationChecklistClient";

export const dynamic = "force-dynamic";

export default async function RelocationPage() {
  const items = await prisma.relocationChecklist.findMany({
    orderBy: { category: "asc" },
  });

  // Separate ES and DE items
  const esItems = items.filter((item) => item.country === "ES");
  const deItems = items.filter((item) => item.country === "DE");

  const calculateProgress = (itemList: typeof items) => {
    if (itemList.length === 0) return 0;
    const completed = itemList.filter((i) => i.done).length;
    return Math.round((completed / itemList.length) * 100);
  };

  const esProgress = calculateProgress(esItems);
  const deProgress = calculateProgress(deItems);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Relocation
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Relocation Checklists
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Manage your pre-arrival and first-30-days tasks to ensure a smooth transition to your target European destination.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Spain Section */}
        <div className="glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>🇪🇸</span> Spain (Barcelona)
            </h3>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              {esProgress}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${esProgress}%` }}
            />
          </div>

          {esItems.length > 0 ? (
            <RelocationChecklistClient initialItems={esItems} />
          ) : (
            <p className="text-sm text-muted-foreground">No relocation items logged for Spain.</p>
          )}
        </div>

        {/* Germany Section */}
        <div className="glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>🇩🇪</span> Germany (Berlin)
            </h3>
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400">
              {deProgress}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${deProgress}%` }}
            />
          </div>

          {deItems.length > 0 ? (
            <RelocationChecklistClient initialItems={deItems} />
          ) : (
            <p className="text-sm text-muted-foreground">No relocation items logged for Germany.</p>
          )}
        </div>
      </div>
    </div>
  );
}
