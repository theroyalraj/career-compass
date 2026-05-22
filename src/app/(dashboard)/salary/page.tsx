import { prisma } from "@/lib/db";
import { SalaryCalculatorClient } from "./SalaryCalculatorClient";

export const dynamic = "force-dynamic";

export default async function SalaryPage() {
  const dbScenarios = await prisma.salaryScenario.findMany({
    orderBy: { grossAnnual: "desc" },
  });

  // Default fallback scenarios if DB is empty
  const fallbackScenarios = [
    {
      id: "spotify-de",
      label: "Spotify (Berlin, DE) — Senior ML",
      country: "Germany",
      grossAnnual: 130000,
      currency: "EUR",
      expectedNet: 6400, // Monthly net after tax
      notes: "Senior ML engineer understanding team. High Blue-Card tier.",
    },
    {
      id: "ableton-de",
      label: "Ableton (Berlin, DE) — DSP/Audio",
      country: "Germany",
      grossAnnual: 75000,
      currency: "EUR",
      expectedNet: 3950,
      notes: "Standard mid-to-senior DSP engineer band in Berlin.",
    },
    {
      id: "barcelona-tech",
      label: "Dolby / Audio Tech (Barcelona, ES)",
      country: "Spain",
      grossAnnual: 55000,
      currency: "EUR",
      expectedNet: 3200,
      notes: "Competent senior level local pay in Catalonia.",
    },
  ];

  const scenarios = dbScenarios.length > 0 ? dbScenarios : fallbackScenarios;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Financials & ROI
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Salary & Loan EMI Calculator
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Assess the financial return of your UPF SMC investment. Drag salary levels to see estimated tax deductions in Germany and Spain, and compare monthly loan repayments.
          </p>
        </div>
      </div>

      <SalaryCalculatorClient preCalculatedScenarios={scenarios} />
    </div>
  );
}
