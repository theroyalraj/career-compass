"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function toggleRelocationItem(id: string, done: boolean) {
  await prisma.relocationChecklist.update({
    where: { id },
    data: { done },
  });
  revalidatePath("/relocation");
}
