import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Portfolio gravity for Audio/ML — ship demos, READMEs, and measurable impact."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="group">
            <div className="glass-card h-full transition-transform duration-200 group-hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold group-hover:text-primary">{p.name}</h3>
                <Badge>{p.status}</Badge>
              </div>
              {p.tagline && (
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-1">
                {p.stack.slice(0, 5).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
