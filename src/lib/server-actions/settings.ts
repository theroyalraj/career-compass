"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseCefr } from "@/lib/settings-options";

export async function updateSettingsPreferences(formData: FormData) {
  const raw = formData.getAll("targetCountries");
  const targetCountries = raw.map((x) => String(x).trim().toUpperCase()).filter(Boolean);

  const spanishLevel = parseCefr(formData.get("spanishLevel")?.toString());
  const germanLevel = parseCefr(formData.get("germanLevel")?.toString());
  const englishLevel = parseCefr(formData.get("englishLevel")?.toString());

  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      targetCountries: targetCountries.length ? targetCountries : ["DE", "ES"],
      spanishLevel,
      germanLevel,
      englishLevel,
    },
    update: {
      targetCountries: targetCountries.length ? targetCountries : ["DE", "ES"],
      spanishLevel,
      germanLevel,
      englishLevel,
    },
  });

  revalidatePath("/settings");
}
