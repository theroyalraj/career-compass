"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { DreamListMode } from "@/lib/dream-list-types";

function revalidateDreamViews() {
  revalidatePath("/dream-list");
}

export async function setDreamListMode(mode: DreamListMode) {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", dreamListMode: mode },
    update: { dreamListMode: mode },
  });
  revalidateDreamViews();
}

export async function addDreamCompany(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;
  const max = await prisma.dreamCompany.aggregate({ _max: { sortOrder: true } });
  await prisma.dreamCompany.create({
    data: {
      name,
      country: emptyToNull(formData.get("country")),
      city: emptyToNull(formData.get("city")),
      url: emptyToNull(formData.get("url")),
      notes: emptyToNull(formData.get("notes")),
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidateDreamViews();
}

export async function addDreamCollege(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;
  const max = await prisma.dreamCollege.aggregate({ _max: { sortOrder: true } });
  await prisma.dreamCollege.create({
    data: {
      name,
      country: emptyToNull(formData.get("country")),
      city: emptyToNull(formData.get("city")),
      url: emptyToNull(formData.get("url")),
      notes: emptyToNull(formData.get("notes")),
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidateDreamViews();
}

export async function deleteDreamCompany(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.dreamCompany.delete({ where: { id } });
  revalidateDreamViews();
}

export async function deleteDreamCollege(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.dreamCollege.delete({ where: { id } });
  revalidateDreamViews();
}

function emptyToNull(v: FormDataEntryValue | null) {
  const s = v?.toString().trim();
  return s ? s : null;
}
