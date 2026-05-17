/** ISO-3166 alpha-2 codes for EU / common pivot destinations */
export const TARGET_COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: "DE", label: "Germany" },
  { code: "ES", label: "Spain" },
  { code: "SE", label: "Sweden" },
  { code: "FI", label: "Finland" },
  { code: "NL", label: "Netherlands" },
  { code: "PT", label: "Portugal" },
  { code: "AT", label: "Austria" },
  { code: "CH", label: "Switzerland" },
  { code: "FR", label: "France" },
  { code: "IE", label: "Ireland" },
  { code: "DK", label: "Denmark" },
  { code: "IT", label: "Italy" },
  { code: "BE", label: "Belgium" },
  { code: "NO", label: "Norway" },
];

export const CEFR_LEVELS = [
  "A0",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export function parseCefr(v: string | null | undefined): CefrLevel {
  const s = (v ?? "A0").toUpperCase();
  return (CEFR_LEVELS as readonly string[]).includes(s) ? (s as CefrLevel) : "A0";
}
