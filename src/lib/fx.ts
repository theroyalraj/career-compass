const FX_PRIMARY =
  process.env.FX_PRIMARY ?? "https://api.frankfurter.app";
const FX_FALLBACK =
  process.env.FX_FALLBACK ?? "https://api.exchangerate.host";

export type FxResult = {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
  source: "frankfurter" | "exchangerate.host";
};

export async function fetchLatestRates(
  base: string,
  quotes: string[],
): Promise<FxResult> {
  const symbols = quotes.filter((q) => q !== base).join(",");
  try {
    const url = `${FX_PRIMARY}/latest?from=${base}&to=${symbols}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Frankfurter error");
    const data = (await res.json()) as {
      base: string;
      rates: Record<string, number>;
    };
    return {
      base: data.base,
      rates: data.rates,
      fetchedAt: new Date().toISOString(),
      source: "frankfurter",
    };
  } catch {
    const url = `${FX_FALLBACK}/latest?base=${base}&symbols=${symbols}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("FX fallback failed");
    const data = (await res.json()) as {
      base: string;
      rates: Record<string, number>;
    };
    return {
      base: data.base,
      rates: data.rates,
      fetchedAt: new Date().toISOString(),
      source: "exchangerate.host",
    };
  }
}
