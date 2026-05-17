import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const [questions, mocks, cases] = await Promise.all([
    prisma.interviewQuestion.findMany({ select: { topic: true } }),
    prisma.mockInterview.findMany({ orderBy: { date: "desc" }, take: 3 }),
    prisma.systemDesignCase.findMany({ take: 4 }),
  ]);

  const byTopic = new Map<string, number>();
  for (const q of questions) {
    byTopic.set(q.topic, (byTopic.get(q.topic) ?? 0) + 1);
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Interview prep"
        description="ML, audio, system design, and mocks — drill cards and cases ship next."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from(byTopic.entries()).map(([topic, count]) => (
          <div key={topic} className="glass-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Topic
            </p>
            <p className="text-2xl font-bold capitalize">{topic}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {count} questions banked
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="font-semibold">System design cases</h3>
          <ul className="mt-4 space-y-2">
            {cases.map((c) => (
              <li key={c.id}>
                <Link
                  href="/interview/system-design"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {c.title}
                </Link>
                <p className="text-xs text-muted-foreground">{c.domain}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card">
          <h3 className="font-semibold">Recent mocks</h3>
          {mocks.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No mocks logged yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {mocks.map((m) => (
                <li key={m.id}>
                  {m.topic} · {m.durationMin}m
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/interview/ml">
          <Badge className="h-9 cursor-pointer px-4 py-1.5">ML drill →</Badge>
        </Link>
        <Link href="/interview/audio">
          <Badge className="h-9 cursor-pointer px-4 py-1.5" variant="secondary">
            Audio drill →
          </Badge>
        </Link>
        <Link href="/interview/mocks">
          <Badge className="h-9 cursor-pointer px-4 py-1.5" variant="outline">
            Mocks →
          </Badge>
        </Link>
      </div>
    </div>
  );
}
