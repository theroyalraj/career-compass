import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function ResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const r = await prisma.resume.findUnique({ where: { id: params.id } });
  if (!r) notFound();
  const content = r.contentJson as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={r.name} description={r.variant ?? "Structured CV JSON"} />
      <div className="glass-card overflow-x-auto text-xs">
        <pre className="text-muted-foreground">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}
