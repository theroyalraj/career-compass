"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateQuestionConfidence(id: string, confidence: number) {
  await prisma.interviewQuestion.update({
    where: { id },
    data: { confidence, lastReviewed: new Date() },
  });
  revalidatePath("/interview/ml");
  revalidatePath("/interview/audio");
}

export async function logMockInterview(formData: {
  topic: string;
  partner?: string;
  durationMin: number;
  rating?: number;
  notesMd?: string;
  recordingUrl?: string;
}) {
  await prisma.mockInterview.create({
    data: {
      topic: formData.topic,
      partner: formData.partner || null,
      durationMin: formData.durationMin,
      rating: formData.rating || null,
      notesMd: formData.notesMd || null,
      recordingUrl: formData.recordingUrl || null,
      date: new Date(),
    },
  });
  revalidatePath("/interview/mocks");
}
