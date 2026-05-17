import { prisma } from "@/lib/db";
import { ManualIntegrationBanner } from "@/components/layout/ManualIntegrationBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobBoard } from "@/components/jobs/JobBoard";

export const dynamic = "force-dynamic";

const jobStatuses = [
  "to_apply",
  "applied",
  "screening",
  "tech",
  "onsite",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Pipeline for EU Audio/ML roles — status changes log automatically."
      />
      <ManualIntegrationBanner title="No LinkedIn Jobs (or other board) API">
        <p>
          Roles are stored manually in your database. The <code className="rounded bg-black/30 px-1 py-0.5 text-xs">source</code>{" "}
          field (e.g. linkedin) is only a label — nothing is fetched from LinkedIn automatically.
        </p>
        <p className="mt-2">
          Paste the real posting URL into each job&apos;s <strong className="text-amber-100">Job posting link</strong> on the
          detail page so you can open the original JD in one click.
        </p>
      </ManualIntegrationBanner>
      <JobBoard initialJobs={jobs} statuses={[...jobStatuses]} />
    </div>
  );
}
