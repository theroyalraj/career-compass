import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  return `${displayHours}:${displayMins} ${ampm}`;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export default async function RoutinePage() {
  const blocks = await prisma.routineBlock.findMany();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Time Management
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Weekly Routine Blocks
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Structured daily timetables ensuring high-intensity study, coding, and networking fit seamlessly around your primary work commitments.
          </p>
        </div>
      </div>

      {/* Routine Grid */}
      <div className="grid gap-6 xl:grid-cols-7 lg:grid-cols-3 md:grid-cols-2">
        {DAYS_OF_WEEK.map((day) => {
          const dayBlocks = blocks
            .filter((b) => b.dayOfWeek === day.value)
            .sort((a, b) => a.startMin - b.startMin);

          return (
            <div key={day.value} className="glass-card flex flex-col space-y-4">
              <h3 className="text-lg font-bold border-b border-white/5 pb-2 text-foreground text-center">
                {day.label}
              </h3>

              <div className="flex-1 space-y-3">
                {dayBlocks.length > 0 ? (
                  dayBlocks.map((block) => {
                    const blockColor = block.color || "#64748b";
                    return (
                      <div
                        key={block.id}
                        className="rounded-xl border border-white/5 p-3 space-y-1 relative overflow-hidden transition-all duration-300 hover:scale-[1.03]"
                        style={{
                          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.04) 100%)`,
                          borderLeft: `4px solid ${blockColor}`,
                        }}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          {block.category}
                        </span>
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {block.label}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatTime(block.startMin)} - {formatTime(block.endMin)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center py-8">
                    <p className="text-xs text-muted-foreground text-center">No blocks scheduled</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer advice */}
      <div className="glass-card border-l-4 border-emerald-500 bg-emerald-500/5">
        <h4 className="text-sm font-bold text-foreground">💡 High-Intensity Routine Structure</h4>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Maintain the **&quot;Deep Work — Projects&quot;** and **&quot;Audio/ML Study&quot;** blocks consistently during weekdays (evenings). This structure guarantees 
          over 12 hours of deep weekly study, building critical project momentum (such as the EarTikl demo) without interfering with your current job.
        </p>
      </div>
    </div>
  );
}
