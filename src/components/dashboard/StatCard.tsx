import { Briefcase, Target, Users, Wallet } from "lucide-react";

const icons = {
  target: Target,
  briefcase: Briefcase,
  users: Users,
  wallet: Wallet,
} as const;

export function StatCard({
  label,
  value,
  deltaLabel,
  icon,
}: {
  label: string;
  value: string;
  deltaLabel?: string;
  icon: keyof typeof icons;
}) {
  const Icon = icons[icon];
  return (
    <div className="glass-card group relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 tabular-nums text-3xl font-bold tracking-tight">{value}</p>
          {deltaLabel && (
            <p className="mt-1 text-xs text-muted-foreground">{deltaLabel}</p>
          )}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
