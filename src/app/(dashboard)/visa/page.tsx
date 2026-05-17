import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function VisaPage() {
  const tracks = await prisma.visaTrack.findMany({
    include: { documents: true },
    orderBy: { country: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visa tracker"
        description="Parallel pathways with document states — synced to your relocation checklist."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {tracks.map((tr) => (
          <div key={tr.id} className="glass-card">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">
                {tr.country} · {tr.pathway.replace(/-/g, " ")}
              </h3>
              <Badge>{tr.status}</Badge>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {tr.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2"
                >
                  <span>{d.name}</span>
                  <span className="text-xs text-muted-foreground">{d.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
