import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { DreamListModeToggle } from "@/components/dream-list/DreamListModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addDreamCollege,
  addDreamCompany,
  deleteDreamCollege,
  deleteDreamCompany,
} from "@/lib/server-actions/dream-list";
import type { DreamListMode } from "@/lib/dream-list-types";

export const dynamic = "force-dynamic";

export default async function DreamListPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const mode: DreamListMode =
    settings?.dreamListMode === "colleges" ? "colleges" : "companies";

  const [companies, colleges] = await Promise.all([
    prisma.dreamCompany.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.dreamCollege.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Dream list"
          description={
            mode === "companies"
              ? "Target employers you want to work for — separate from your active job pipeline."
              : "Target schools or programs — keep links and notes for applications."
          }
        />
        <DreamListModeToggle mode={mode} className="self-start" />
      </div>

      <p className="text-sm text-muted-foreground">
        Global mode is also in the top bar: it switches whether the app highlights{" "}
        <strong className="text-foreground/90">companies</strong> or{" "}
        <strong className="text-foreground/90">colleges</strong> for your dream targets. Both lists
        stay saved; only the active focus changes.
      </p>

      {mode === "companies" ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Dream companies
          </h2>
          <AddRowForm action={addDreamCompany} noun="company" />
          <DreamTable
            rows={companies}
            empty="No dream companies yet — add employers you are aiming for."
            deleteAction={deleteDreamCompany}
          />
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Dream colleges
          </h2>
          <AddRowForm action={addDreamCollege} noun="college" />
          <DreamTable
            rows={colleges}
            empty="No dream colleges yet — add schools or graduate programs."
            deleteAction={deleteDreamCollege}
          />
        </section>
      )}

      <section className="space-y-3 border-t border-white/10 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {mode === "companies" ? "Dream colleges (other list)" : "Dream companies (other list)"}
        </h2>
        <p className="text-xs text-muted-foreground">
          Switch mode above to add or remove items in this list.
        </p>
        {mode === "companies" ? (
          <DreamTable rows={colleges} empty="No colleges saved." readOnly />
        ) : (
          <DreamTable rows={companies} empty="No companies saved." readOnly />
        )}
      </section>
    </div>
  );
}

function AddRowForm({
  action,
  noun,
}: {
  action: (formData: FormData) => Promise<void>;
  noun: string;
}) {
  return (
    <form action={action} className="glass-card grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <label className="mb-1 block text-xs text-muted-foreground">Name *</label>
        <Input name="name" required placeholder={`Dream ${noun} name`} className="h-9" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">City</label>
        <Input name="city" placeholder="Berlin" className="h-9" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Country</label>
        <Input name="country" placeholder="DE" className="h-9" />
      </div>
      <div className="lg:col-span-2">
        <label className="mb-1 block text-xs text-muted-foreground">URL</label>
        <Input name="url" type="url" placeholder="https://…" className="h-9" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <label className="mb-1 block text-xs text-muted-foreground">Notes</label>
        <Input name="notes" placeholder="Program, team, why it matters…" className="h-9" />
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-2">
        <Button type="submit" className="w-full sm:w-auto">
          Add {noun}
        </Button>
      </div>
    </form>
  );
}

type DreamRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  url: string | null;
  notes: string | null;
};

function DreamTable({
  rows,
  empty,
  deleteAction,
  readOnly,
}: {
  rows: DreamRow[];
  empty: string;
  deleteAction?: (formData: FormData) => Promise<void>;
  readOnly?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="glass-card py-8 text-center text-sm text-muted-foreground">{empty}</div>
    );
  }

  return (
    <div className="glass-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Notes</TableHead>
            {!readOnly && deleteAction && <TableHead className="w-[100px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {[r.city, r.country].filter(Boolean).join(", ") || "—"}
              </TableCell>
              <TableCell>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="max-w-[400px] text-muted-foreground">
                {r.notes ?? "—"}
              </TableCell>
              {!readOnly && deleteAction && (
                <TableCell>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Remove
                    </Button>
                  </form>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
