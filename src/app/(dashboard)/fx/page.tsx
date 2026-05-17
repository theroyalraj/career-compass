"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type FxPayload = {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
  source: string;
};

export default function FxPage() {
  const [base, setBase] = useState("EUR");
  const [amount, setAmount] = useState("1000");
  const [to, setTo] = useState("INR");

  const { data, isLoading, error } = useQuery({
    queryKey: ["fx", base],
    queryFn: async () => {
      const res = await fetch(`/api/fx?base=${base}&quotes=INR,USD,GBP,SEK`);
      if (!res.ok) throw new Error("FX failed");
      return (await res.json()) as FxPayload;
    },
  });

  const converted = useMemo(() => {
    if (!data?.rates || !amount) return null;
    const n = parseFloat(amount.replace(/,/g, ""));
    if (Number.isNaN(n)) return null;
    const rate = data.rates[to];
    if (!rate) return null;
    return n * rate;
  }, [amount, data, to]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Foreign exchange"
        description="Live rates via Frankfurter with automatic fallback — cached one hour at the edge."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{isLoading ? "Loading…" : "Live"}</Badge>
            {data && (
              <span className="text-xs text-muted-foreground">
                Source: {data.source} · {new Date(data.fetchedAt).toLocaleString()}
              </span>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive">
              Rates unavailable offline — start Docker DB is not required for FX.
            </p>
          )}
          {data && (
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.rates).map(([k, v]) => (
                <li
                  key={k}
                  className="flex justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 tabular-nums"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span>{v.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="glass-card space-y-4">
          <h3 className="text-sm font-semibold">Converter</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Select value={base} onValueChange={setBase}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["EUR", "USD", "INR", "GBP"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(data ? Object.keys(data.rates) : ["INR", "USD", "GBP", "SEK"]).map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Result
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {converted != null ? converted.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}{" "}
              {to}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
