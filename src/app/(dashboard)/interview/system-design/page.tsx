import { prisma } from "@/lib/db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export default async function SystemDesignPage() {
  const cases = await prisma.systemDesignCase.findMany();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Interview Prep
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            System Design Cases
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Architecture and design drills for senior audio-ML engineering roles. Study ASR pipelines, recommenders, and dsp feature stores.
          </p>
        </div>
      </div>

      {/* Main cases */}
      <div className="space-y-6">
        {cases.length > 0 ? (
          cases.map((cs) => (
            <div key={cs.id} className="glass-card">
              <div className="flex justify-between items-start flex-wrap gap-2 border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    {cs.domain}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1">{cs.title}</h3>
                </div>
                <div className="flex gap-2">
                  {cs.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Architecture Prompt</h4>
                  <p className="text-sm text-muted-foreground bg-white/[0.02] p-4 rounded-xl border border-white/5 font-mono leading-relaxed">
                    {cs.promptMd}
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="solution" className="border-b-0">
                    <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline py-2">
                      💡 View Design Strategy & Solution
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 text-sm text-muted-foreground leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/5 space-y-4">
                      {cs.solutionMd ? (
                        <p>{cs.solutionMd}</p>
                      ) : (
                        <div className="space-y-4">
                          <p>
                            <strong>1. High-Level Architecture:</strong>
                            <br />
                            Implement a decoupled microservice layout. Standardize ingest via Kafka pipelines partition-mapped by user ID, feeding multiple real-time DSP workers running local C++ Librosa bindings, writing directly to an online Feature Store (e.g. Feast).
                          </p>
                          <p>
                            <strong>2. Scale & Optimizations:</strong>
                            <br />
                            Utilize memory-mapped sound buffers (MMAP) to reduce read IO. Introduce an edge CDN caching scheme for recurrent feature hashes. Enable horizontal autoscaling (KEDA) based on inbound audio message queues.
                          </p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No system design cases logged in the database.</p>
        )}
      </div>
    </div>
  );
}
