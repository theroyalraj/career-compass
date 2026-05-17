import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [accounts, goals, txs] = await Promise.all([
    prisma.account.findMany(),
    prisma.savingsGoal.findMany(),
    prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 12 }),
  ]);

  const net =
    accounts.reduce((s, a) => s + a.openingBalance, 0) +
    txs.reduce((s, t) => s + (t.type === "expense" ? -Math.abs(t.amount) : t.amount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance hub"
        description="Runway, savings goals, and cash movement — extend with charts from PLAN §12.14."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Accounts (opening + recent)"
          value={`₹${Math.round(net).toLocaleString()}`}
          deltaLabel="simplified rollup"
          icon="wallet"
        />
        <StatCard
          label="Savings goals"
          value={String(goals.length)}
          deltaLabel="active targets"
          icon="target"
        />
        <StatCard
          label="Recent transactions"
          value={String(txs.length)}
          deltaLabel="loaded"
          icon="briefcase"
        />
      </div>
      <div className="glass-card">
        <h3 className="font-semibold">Latest ledger</h3>
        <ul className="mt-4 divide-y divide-white/5 text-sm">
          {txs.map((t) => (
            <li key={t.id} className="flex justify-between py-2 tabular-nums">
              <span className="text-muted-foreground">{t.category}</span>
              <span className={t.type === "expense" ? "text-destructive" : "text-emerald-400"}>
                {t.type === "expense" ? "-" : "+"}
                {Math.abs(t.amount).toLocaleString()} {t.currency}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
