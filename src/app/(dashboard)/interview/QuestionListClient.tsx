"use client";

import { useTransition } from "react";
import { updateQuestionConfidence } from "@/lib/server-actions/interview-actions";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Question {
  id: string;
  topic: string;
  subTopic: string | null;
  prompt: string;
  answerMd: string | null;
  difficulty: number;
  lastReviewed: Date | null;
  confidence: number;
  source: string | null;
  tags: string[];
}

export function QuestionListClient({
  initialQuestions,
  topic,
}: {
  initialQuestions: Question[];
  topic: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleConfidenceChange = (id: string, newConfidence: number) => {
    startTransition(async () => {
      await updateQuestionConfidence(id, newConfidence);
    });
  };

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 2) return { label: "Easy", color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" };
    if (diff <= 4) return { label: "Medium", color: "text-amber-400 bg-amber-400/10 border-amber-500/20" };
    return { label: "Hard", color: "text-red-400 bg-red-400/10 border-red-500/20" };
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {initialQuestions.length > 0 ? (
        initialQuestions.map((q) => {
          const diff = getDifficultyLabel(q.difficulty);
          return (
            <div key={q.id} className="glass-card flex flex-col space-y-4 justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${diff.color}`}>
                    {diff.label}
                  </span>
                  {q.subTopic && (
                    <span className="text-xs font-medium text-muted-foreground">{q.subTopic}</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">{q.prompt}</h3>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                {/* Confidence Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Confidence Level:</span>
                    <span className="text-primary font-bold">{q.confidence} / 5</span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[q.confidence]}
                    disabled={isPending}
                    onValueChange={(val) => handleConfidenceChange(q.id, val[0])}
                    className="py-1"
                  />
                </div>

                {/* Collapsible Answer */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="answer" className="border-b-0">
                    <AccordionTrigger className="text-xs font-bold text-secondary hover:no-underline py-1">
                      📖 View Model Answer
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-xs text-muted-foreground leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/5">
                      {q.answerMd ? (
                        <p>{q.answerMd}</p>
                      ) : (
                        <p>
                          <strong>Key Concept:</strong> This question requires reviewing core principles, formulating active mathematical formulations, and presenting structural trade-offs (e.g. performance bounds, memory footprints, processing latency budgets). Prepare a crisp 3-sentence summary for your interview.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-2 text-center py-12 glass-card">
          <p className="text-sm text-muted-foreground">No interview questions logged for {topic}.</p>
        </div>
      )}
    </div>
  );
}
