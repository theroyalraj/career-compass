"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function completeTask(taskId: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { status: "done", completedAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function moveTaskStatus(taskId: string, status: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
  revalidatePath("/tasks");
}
