"use client";

import { useState, useTransition } from "react";
import { logMockInterview } from "@/lib/server-actions/interview-actions";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MockInterview {
  id: string;
  date: Date;
  partner: string | null;
  topic: string;
  durationMin: number;
  rating: number | null;
  notesMd: string | null;
  recordingUrl: string | null;
}

export function MockInterviewsClient({
  initialMocks,
}: {
  initialMocks: MockInterview[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [topic, setTopic] = useState("");
  const [partner, setPartner] = useState("");
  const [durationMin, setDurationMin] = useState(45);
  const [rating, setRating] = useState(4);
  const [notesMd, setNotesMd] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || durationMin <= 0) return;

    startTransition(async () => {
      await logMockInterview({
        topic,
        partner: partner || undefined,
        durationMin: Number(durationMin),
        rating: Number(rating) || undefined,
        notesMd: notesMd || undefined,
        recordingUrl: recordingUrl || undefined,
      });

      // Reset form
      setTopic("");
      setPartner("");
      setDurationMin(45);
      setRating(4);
      setNotesMd("");
      setRecordingUrl("");
      setIsOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-foreground">Session Log</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold">
              + Log Mock Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-white/10 text-foreground max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Log Mock Interview</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="topic">Topic / Domain</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Real-time ASR Pipeline, DSP MFCC basics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="partner">Interview Partner</Label>
                  <Input
                    id="partner"
                    placeholder="e.g. Alex Müller"
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration">Duration (Minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="rating">Self Rating (1 to 5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes">Key Notes / Feedback</Label>
                <textarea
                  id="notes"
                  placeholder="e.g. Nailed multi-threading design, but got confused about windowing functions in DSP overlap-add."
                  value={notesMd}
                  onChange={(e) => setNotesMd(e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-white/5 border border-white/10 p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="recordingUrl">Recording Link (Drive/Loom)</Label>
                <Input
                  id="recordingUrl"
                  placeholder="e.g. https://drive.google.com/..."
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold mt-2"
              >
                {isPending ? "Saving..." : "Log Session"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {initialMocks.length > 0 ? (
          initialMocks.map((mock) => (
            <div
              key={mock.id}
              className="glass-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-foreground">{mock.topic}</h4>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs text-primary">
                    {mock.durationMin} mins
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {mock.partner && (
                    <span>
                      Partner: <strong>{mock.partner}</strong>
                    </span>
                  )}
                  <span>Date: {format(new Date(mock.date), "MMM dd, yyyy")}</span>
                </div>
                {mock.notesMd && <p className="text-xs text-muted-foreground pt-1">{mock.notesMd}</p>}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                {mock.rating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < (mock.rating || 0) ? "text-emerald-400" : "text-white/10"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                {mock.recordingUrl && (
                  <a
                    href={mock.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    🎦 Listen to Recording
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 glass-card">
            <p className="text-sm text-muted-foreground">No mock interviews logged yet. Start practicing with peers!</p>
          </div>
        )}
      </div>
    </div>
  );
}
