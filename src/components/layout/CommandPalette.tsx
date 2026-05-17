"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, LayoutDashboard, User, Briefcase, CheckSquare } from "lucide-react";

type Hit = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Hit[]>([]);

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = (await res.json()) as { results: Hit[] };
      setResults(data.results ?? []);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(q), 200);
    return () => clearTimeout(t);
  }, [q, runSearch]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tasks, jobs, contacts, pages…"
        value={q}
        onValueChange={setQ}
      />
      <CommandList className="max-h-[min(60vh,420px)]">
        <CommandEmpty>No matches. Try another keyword.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((r) => (
              <CommandItem
                key={`${r.type}-${r.id}`}
                value={`${r.title} ${r.subtitle ?? ""}`}
                onSelect={() => {
                  onOpenChange(false);
                  setQ("");
                  if (r.type === "task") router.push(`/tasks?id=${r.id}`);
                  else if (r.type === "job") router.push(`/jobs/${r.id}`);
                  else if (r.type === "contact") router.push(`/network/${r.id}`);
                  else if (r.type === "page") router.push(r.id);
                }}
              >
                {r.type === "task" && <CheckSquare className="mr-2 h-4 w-4" />}
                {r.type === "job" && <Briefcase className="mr-2 h-4 w-4" />}
                {r.type === "contact" && <User className="mr-2 h-4 w-4" />}
                {r.type === "page" && <LayoutDashboard className="mr-2 h-4 w-4" />}
                <div className="flex flex-col">
                  <span>{r.title}</span>
                  {r.subtitle && (
                    <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Jump">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              router.push("/");
            }}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              router.push("/tasks");
            }}
          >
            <CheckSquare className="mr-2 h-4 w-4" /> Tasks
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              router.push("/jobs");
            }}
          >
            <Briefcase className="mr-2 h-4 w-4" /> Jobs
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              router.push("/finance");
            }}
          >
            <FileText className="mr-2 h-4 w-4" /> Finance
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
