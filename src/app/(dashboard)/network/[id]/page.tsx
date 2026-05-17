import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ManualIntegrationBanner } from "@/components/layout/ManualIntegrationBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const c = await prisma.contact.findUnique({
    where: { id: params.id },
    include: { touches: { orderBy: { date: "desc" } } },
  });
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={c.name} description={[c.role, c.company].filter(Boolean).join(" · ")} />
      <ManualIntegrationBanner title="LinkedIn profile is optional manual data">
        <p>
          There is no LinkedIn API. Add a profile URL below so you can jump to their page; nothing
          here updates from LinkedIn automatically.
        </p>
      </ManualIntegrationBanner>
      <div className="flex flex-wrap gap-2">
        {c.type && <Badge>{c.type}</Badge>}
        <Badge variant="outline">Warmth {c.warmth}/5</Badge>
      </div>
      <div className="glass-card text-sm">
        <h3 className="font-semibold">LinkedIn</h3>
        {c.linkedin ? (
          <a
            href={c.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all text-primary underline-offset-4 hover:underline"
          >
            {c.linkedin}
          </a>
        ) : (
          <p className="mt-2 text-muted-foreground" role="status">
            No LinkedIn URL saved — set <code className="rounded bg-muted px-1 py-0.5 text-xs">linkedin</code> on this
            contact in the database (or add an edit form later).
          </p>
        )}
      </div>
      <div className="glass-card">
        <h3 className="font-semibold">Touch timeline</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {c.touches.map((t) => (
            <li key={t.id}>
              <span className="text-xs text-muted-foreground">
                {format(t.date, "MMM d, yyyy")} · {t.channel}
              </span>
              {t.outcome && (
                <p className="text-muted-foreground">{t.outcome}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
