import Link from "next/link";
import { prisma } from "@/lib/db";
import { ManualIntegrationBanner } from "@/components/layout/ManualIntegrationBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const items = await prisma.learningItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning"
        description="Courses, papers, and tutorials — progress rolls into your pivot readiness score."
      />
      <ManualIntegrationBanner title="Manual learning tracker — no LMS or LinkedIn sync">
        <p>
          This app does not connect to Coursera, Udemy, LinkedIn Learning, or similar APIs. There is
          no per-course <strong className="text-amber-100">section or lesson tree</strong> in the
          database yet—only one row per resource (title, optional course URL, notes, progress %).
        </p>
        <p className="mt-2">
          Add your real course home links in each item&apos;s detail page; use notes for module /
          week URLs until a syllabus model exists.
        </p>
      </ManualIntegrationBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link key={it.id} href={`/learning/${it.id}`} className="group">
            <div className="glass-card h-full transition-transform duration-200 group-hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug group-hover:text-primary">
                  {it.title}
                </h3>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {it.kind}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {it.provider ?? "Self-paced"}
              </p>
              <div className="mt-4">
                <Progress value={it.progressPct} className="h-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">{it.progressPct}%</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
