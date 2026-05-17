import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const p = await prisma.project.findUnique({ where: { id: params.id } });
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={p.name} description={p.tagline ?? ""} />
      <div className="flex flex-wrap gap-2">
        <Badge>{p.status}</Badge>
        {p.audioMl && <Badge variant="secondary">Audio / ML</Badge>}
        {p.stack.map((s) => (
          <Badge key={s} variant="outline">
            {s}
          </Badge>
        ))}
      </div>
      {p.readmeMd && (
        <div className="glass-card whitespace-pre-wrap text-sm">{p.readmeMd}</div>
      )}
    </div>
  );
}
