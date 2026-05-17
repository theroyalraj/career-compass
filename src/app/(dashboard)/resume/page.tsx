import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ResumeListPage() {
  const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resume library"
        description="Structured JSON + PDF export — tailor variants per company from the detail view."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {resumes.map((r) => (
          <Link key={r.id} href={`/resume/${r.id}`} className="group">
            <div className="glass-card transition-transform duration-200 group-hover:-translate-y-0.5">
              <h3 className="text-lg font-semibold group-hover:text-primary">{r.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.variant && <Badge variant="outline">{r.variant}</Badge>}
                {r.targetCompany && (
                  <Badge variant="secondary">Tailored: {r.targetCompany}</Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
