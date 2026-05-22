import { prisma } from "@/lib/db";
import { MockInterviewsClient } from "./MockInterviewsClient";

export const dynamic = "force-dynamic";

export default async function MockInterviewsPage() {
  const mocks = await prisma.mockInterview.findMany({
    orderBy: { date: "desc" },
  });

  // Calculate statistics
  const totalMocks = mocks.length;
  const totalDuration = mocks.reduce((sum, m) => sum + m.durationMin, 0);
  const totalHours = (totalDuration / 60).toFixed(1);

  const ratedMocks = mocks.filter((m) => m.rating !== null);
  const avgRating = ratedMocks.length
    ? (ratedMocks.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMocks.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Interview Prep
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Mock Interviews
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Log and review your peer mock interviews, track performance ratings, and catalog recordings to polish your delivery before final rounds.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-3">
        <div className="glass-card text-center p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Total Sessions
          </span>
          <span className="text-2xl font-extrabold text-foreground block mt-1">
            {totalMocks}
          </span>
        </div>
        <div className="glass-card text-center p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Prep Time (Hrs)
          </span>
          <span className="text-2xl font-extrabold text-primary block mt-1">
            {totalHours}
          </span>
        </div>
        <div className="glass-card text-center p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Avg Rating
          </span>
          <span className="text-2xl font-extrabold text-emerald-400 block mt-1">
            {avgRating} / 5
          </span>
        </div>
      </div>

      <MockInterviewsClient initialMocks={mocks} />
    </div>
  );
}
