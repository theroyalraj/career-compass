import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ManualIntegrationBanner } from "@/components/layout/ManualIntegrationBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function LearningDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await prisma.learningItem.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={item.title} description={item.provider ?? item.kind} />
      <ManualIntegrationBanner title="No automated course sections">
        <p>
          Section and lesson URLs are not imported from any platform. Use{" "}
          <strong className="text-amber-100">Course link</strong> below for the canonical URL, and{" "}
          <strong className="text-amber-100">Notes</strong> for week/module links or a syllabus
          outline.
        </p>
      </ManualIntegrationBanner>
      <div className="flex flex-wrap gap-2">
        <Badge>{item.kind}</Badge>
        <Badge variant="outline">{item.status}</Badge>
        <Badge variant="secondary">{item.progressPct}%</Badge>
      </div>
      {item.topic.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.topic.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}
      <div className="glass-card text-sm">
        <h3 className="font-semibold">Course link</h3>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all text-primary underline-offset-4 hover:underline"
          >
            {item.url}
          </a>
        ) : (
          <p className="mt-2 text-muted-foreground" role="status">
            No course URL saved yet — edit this row in the database or add a form later to set{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">url</code>.
          </p>
        )}
      </div>
      {item.notesMd && (
        <div className="glass-card whitespace-pre-wrap text-sm">{item.notesMd}</div>
      )}
    </div>
  );
}
