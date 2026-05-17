import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ManualIntegrationBanner } from "@/components/layout/ManualIntegrationBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { events: { orderBy: { date: "desc" } } },
  });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader title={job.company} description={job.role} />
      <ManualIntegrationBanner title="LinkedIn is not connected">
        <p>
          Job rows are whatever you (or seed data) entered. There is no OAuth or LinkedIn Talent
          integration — add real posting links yourself.
        </p>
      </ManualIntegrationBanner>
      <div className="glass-card flex flex-wrap gap-2">
        <Badge>{job.status.replace(/_/g, " ")}</Badge>
        {job.country && <Badge variant="outline">{job.country}</Badge>}
        {job.source && (
          <Badge variant="outline" className="capitalize">
            Source: {job.source.replace(/_/g, " ")}
          </Badge>
        )}
        {job.visaSponsor && (
          <Badge variant="secondary">Visa: {job.visaSponsor}</Badge>
        )}
        {job.salaryMin && (
          <Badge variant="outline" className="tabular-nums">
            €{job.salaryMin.toLocaleString()} – {job.salaryMax?.toLocaleString()}
          </Badge>
        )}
      </div>
      <div className="glass-card text-sm">
        <h3 className="font-semibold">Job posting link</h3>
        {job.jdUrl ? (
          <a
            href={job.jdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all text-primary underline-offset-4 hover:underline"
          >
            {job.jdUrl}
          </a>
        ) : (
          <p className="mt-2 text-muted-foreground" role="status">
            No job posting URL saved — add the LinkedIn (or company careers page) link to{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">jdUrl</code> for this row.
          </p>
        )}
      </div>
      <div className="glass-card">
        <h3 className="font-semibold">Timeline</h3>
        <Separator className="my-4 bg-white/10" />
        <ul className="space-y-3 text-sm">
          {job.events.map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className="shrink-0 text-xs text-muted-foreground">
                {format(e.date, "MMM d, HH:mm")}
              </span>
              <div>
                <p className="font-medium">{e.kind.replace(/_/g, " ")}</p>
                {e.body && (
                  <p className="text-muted-foreground">{e.body}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
