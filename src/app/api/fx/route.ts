import { NextResponse } from "next/server";
import { fetchLatestRates } from "@/lib/fx";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") ?? "EUR").toUpperCase();
  const quoteParam = searchParams.get("quotes") ?? "INR,USD,GBP,SEK";
  const quotes = quoteParam.split(",").map((s) => s.trim().toUpperCase());

  try {
    const result = await fetchLatestRates(base, quotes);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not load FX rates" },
      { status: 502 },
    );
  }
}
