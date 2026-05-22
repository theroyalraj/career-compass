import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Industry Ecosystem
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Events & Conferences
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Discover leading global summits, academic conferences, and conventions focused on music information retrieval (MIR) and audio engineering.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length > 0 ? (
          events.map((ev) => {
            return (
              <div
                key={ev.id}
                className="glass-card relative overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                      {ev.kind}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                      {ev.city && ev.country ? `${ev.city}, ${ev.country}` : "Remote"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground leading-snug">{ev.name}</h3>

                  <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-bold text-foreground">
                        {format(new Date(ev.startDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {ev.cfpDeadline && (
                      <div className="flex justify-between">
                        <span>CFP Deadline:</span>
                        <span className="font-bold text-red-400">
                          {format(new Date(ev.cfpDeadline), "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {ev.url && (
                  <div className="pt-4 mt-4 border-t border-white/5">
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Official Site ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12 glass-card">
            <p className="text-sm text-muted-foreground">No upcoming events logged in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
