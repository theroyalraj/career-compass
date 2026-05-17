import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ManualIntegrationBannerProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

/** Visible notice when data is manual / no third-party OAuth or sync. */
export function ManualIntegrationBanner({
  title,
  children,
  className,
}: ManualIntegrationBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border border-amber-500/35 bg-amber-950/45 px-4 py-3 text-sm text-amber-50/95 shadow-sm",
        className
      )}
    >
      <p className="font-semibold tracking-tight text-amber-100">{title}</p>
      <div className="mt-1.5 leading-relaxed text-amber-50/85">{children}</div>
    </div>
  );
}
