import { prisma } from "@/lib/db";
import { QuestionListClient } from "../QuestionListClient";

export const dynamic = "force-dynamic";

export default async function MlInterviewPage() {
  const questions = await prisma.interviewQuestion.findMany({
    where: { topic: "ml" },
    orderBy: { difficulty: "asc" },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Interview Prep
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Machine Learning Q&A
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Core machine learning questions, from evaluation metrics to transformer complex-intuition, tracked with real-time confidence scores.
          </p>
        </div>
      </div>

      <QuestionListClient initialQuestions={questions} topic="ml" />
    </div>
  );
}
