import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CEFR_LEVELS, TARGET_COUNTRY_OPTIONS } from "@/lib/settings-options";
import { updateSettingsPreferences } from "@/lib/server-actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const selected = new Set(s?.targetCountries ?? []);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <PageHeader
        title="Settings"
        description="Target countries for relocation and language levels for CV and prep."
      />

      <form action={updateSettingsPreferences} className="space-y-10">
        <section className="glass-card space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Target countries</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select every country where you would consider living or accepting an offer. Used as
              your global relocation focus (filters, visa notes, etc. can build on this later).
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {TARGET_COUNTRY_OPTIONS.map(({ code, label }) => (
              <label
                key={code}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.06]"
              >
                <input
                  type="checkbox"
                  name="targetCountries"
                  value={code}
                  defaultChecked={selected.has(code)}
                  className="h-4 w-4 rounded border border-primary/50 bg-background accent-primary"
                />
                <span>
                  <span className="font-mono text-xs text-muted-foreground">{code}</span>{" "}
                  <span className="font-medium">{label}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="glass-card space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Language levels (CEFR)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track where you are for CV and interview prep. Spanish here pairs with a daily
              Duolingo habit in seed data.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="englishLevel" className="mb-1.5 block text-xs text-muted-foreground">
                English
              </label>
              <select
                id="englishLevel"
                name="englishLevel"
                defaultValue={s?.englishLevel ?? "C1"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="spanishLevel" className="mb-1.5 block text-xs text-muted-foreground">
                Spanish
              </label>
              <select
                id="spanishLevel"
                name="spanishLevel"
                defaultValue={s?.spanishLevel ?? "A1"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="germanLevel" className="mb-1.5 block text-xs text-muted-foreground">
                German
              </label>
              <select
                id="germanLevel"
                name="germanLevel"
                defaultValue={s?.germanLevel ?? "A1"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Save preferences
        </Button>
      </form>
    </div>
  );
}
