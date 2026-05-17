"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Building2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DreamListMode } from "@/lib/dream-list-types";
import { setDreamListMode } from "@/lib/server-actions/dream-list";
import { toast } from "sonner";

export function DreamListModeToggle({
  mode,
  className,
}: {
  mode: DreamListMode;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function pick(next: DreamListMode) {
    if (next === mode) return;
    start(async () => {
      try {
        await setDreamListMode(next);
        toast.success(next === "companies" ? "Dream list: companies" : "Dream list: colleges");
        router.refresh();
      } catch {
        toast.error("Could not update mode");
      }
    });
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-[11px] font-medium",
        className
      )}
      role="group"
      aria-label="Dream list focus"
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => pick("companies")}
        className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-colors md:px-3",
          mode === "companies"
            ? "bg-primary/25 text-foreground shadow-inner"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Companies</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => pick("colleges")}
        className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-colors md:px-3",
          mode === "colleges"
            ? "bg-primary/25 text-foreground shadow-inner"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <GraduationCap className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Colleges</span>
      </button>
    </div>
  );
}
