"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function moveJobStatus(jobId: string, status: string) {
  const prev = await prisma.job.findUnique({ where: { id: jobId } });
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status,
      ...(status === "applied" && !prev?.appliedAt
        ? { appliedAt: new Date() }
        : {}),
    },
  });
  if (prev && prev.status !== status) {
    await prisma.jobEvent.create({
      data: {
        jobId,
        kind: "status_change",
        body: `${prev.status} → ${status}`,
      },
    });
  }
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}
