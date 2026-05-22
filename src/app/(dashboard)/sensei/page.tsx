"use client";

import { useState, useCallback } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import {
  Mic, Volume2, GraduationCap, BookOpen,
  Terminal, Languages, ArrowRight, PhoneOff, Phone,
  Loader2, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const AGENT_ID = "agent_9601krvk6nm4eka82b6aaq2wtf8v";
const PC_AGENT = "http://localhost:3847";

/** Fire-and-forget: mirrors ElevenLabs session state into the pc-agent SSE bus
 *  so the SenseiWidget floating button reflects the page session. */
function broadcastToWidget(type: string, text = "") {
  fetch(`${PC_AGENT}/voice/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, text }),
  }).catch(() => {}); // intentionally silent — widget is non-critical
}

const QUICK_COMMANDS = [
  { label: "Hola Sensei, enséñame español...", command: "Hola Sensei, enséñame una palabra nueva en español" },
  { label: "Give me an audio quiz in Spanish...", command: "Give me an audio engineering quiz in Spanish" },
  { label: "Test my Barcelona MSc plans...", command: "Test my Barcelona MSc SMC requirements knowledge" },
  { label: "Start a Pomodoro session", command: "Start a Pomodoro focus session" },
];

type ConvStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

function SenseiInner() {
  const [convStatus, setConvStatus] = useState<ConvStatus>("idle");
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  const [latency] = useState<number | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setConvStatus("connected");
      setPermissionError(false);
      broadcastToWidget("listening", "ElevenLabs session connected");
    },
    onDisconnect: () => {
      setConvStatus("disconnected");
      broadcastToWidget("daemon_start", "ElevenLabs session ended");
    },
    onError: (err: string | Error) => {
      const msg = typeof err === "string" ? err : err?.message ?? "Unknown error";
      console.error("[Sensei Agent]", msg);
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("microphone")) {
        setPermissionError(true);
      }
      setConvStatus("error");
      broadcastToWidget("error", msg);
    },
    onMessage: (msg: { source: string; message: string }) => {
      const role = msg.source === "user" ? "user" : "agent";
      setTranscript((prev) => [...prev.slice(-20), { role, text: msg.message }]);
      // Mirror to widget: user speech → "heard", agent reply → "reply"
      broadcastToWidget(role === "user" ? "heard" : "reply", msg.message);
    },
  });

  const startSession = useCallback(async () => {
    setConvStatus("connecting");
    setTranscript([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Sensei] Failed to start:", msg);
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        setPermissionError(true);
      }
      setConvStatus("error");
    }
  }, [conversation]);

  const endSession = useCallback(async () => {
    await conversation.endSession();
    setConvStatus("idle");
  }, [conversation]);

  // Agent status from the hook
  const agentStatus = conversation.status; // 'idle' | 'connecting' | 'connected'
  const isSpeaking = conversation.isSpeaking;
  const isConnected = agentStatus === "connected";
  const isConnecting = convStatus === "connecting" || agentStatus === "connecting";

  const orbColor = isConnecting
    ? "bg-amber-400 dark:bg-amber-500"
    : isConnected && isSpeaking
    ? "bg-amber-400 dark:bg-amber-500"
    : isConnected
    ? "bg-emerald-400 dark:bg-emerald-500"
    : convStatus === "error"
    ? "bg-rose-400 dark:bg-rose-500"
    : "bg-zinc-300 dark:bg-zinc-700";

  const statusLabel = isConnecting
    ? "Connecting..."
    : isConnected && isSpeaking
    ? "Sensei is speaking"
    : isConnected
    ? "Listening..."
    : convStatus === "error"
    ? "Connection error"
    : convStatus === "disconnected"
    ? "Session ended"
    : "Ready to start";

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(240,244,255,1)_0%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,16,28,1)_0%,rgba(5,5,10,1)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes orb-fluid {
          0%, 100% { border-radius: 43% 57% 65% 35% / 40% 45% 55% 60%; }
          33% { border-radius: 65% 35% 50% 50% / 55% 40% 60% 45%; }
          66% { border-radius: 50% 50% 35% 65% / 45% 60% 40% 55%; }
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes aura-pulse {
          0%, 100% { transform: scale(1.05); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes wave-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .orb-float { animation: orb-float 5s ease-in-out infinite; }
        .orb-fluid { animation: orb-fluid 8s ease-in-out infinite; }
        .orb-aura { animation: aura-pulse 3s ease-in-out infinite; }
      `}} />

      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ── Left: Orb + Controls ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Orb Panel */}
          <div className="flex flex-col items-center justify-center min-h-[460px] rounded-2xl bg-white/60 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md p-8 gap-8">

            {/* Status Bar */}
            <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium border bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10">
              <span className={cn("h-2 w-2 rounded-full transition-all duration-500", orbColor,
                isConnected ? "animate-pulse" : ""
              )} />
              <span className="text-zinc-600 dark:text-zinc-300">{statusLabel}</span>
              {latency && <span className="text-zinc-400 ml-1">· {latency}ms</span>}
            </div>

            {/* The Orb */}
            <div className="orb-float relative flex h-56 w-56 items-center justify-center">
              {/* Outer aura */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-3xl opacity-40 orb-aura transition-colors duration-1000",
                orbColor
              )} />

              {/* Orbit rings */}
              <div className="absolute h-60 w-60 rounded-full border border-zinc-200 dark:border-white/5 opacity-40" />
              <div className={cn(
                "absolute h-56 w-56 rounded-full border border-dashed border-zinc-300 dark:border-white/10",
                isConnected ? "animate-[spin_8s_linear_infinite]" : "animate-[spin_30s_linear_infinite]"
              )} />

              {/* Core glass orb */}
              <div className={cn(
                "orb-fluid relative z-10 flex h-44 w-44 items-center justify-center rounded-full shadow-2xl transition-all duration-700",
                "bg-zinc-900/90 dark:bg-zinc-950/50 backdrop-blur-xl border",
                isConnected && isSpeaking
                  ? "border-amber-400/60 shadow-amber-500/30 scale-110"
                  : isConnected
                  ? "border-emerald-400/60 shadow-emerald-500/25 scale-105"
                  : isConnecting
                  ? "border-amber-400/40 shadow-amber-500/20"
                  : "border-zinc-600/30 scale-100"
              )}>
                {/* Glass gloss */}
                <div className="absolute inset-0 z-20 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 55%)" }} />

                {/* Inner glow blobs */}
                <div className={cn(
                  "absolute inset-3 rounded-full blur-xl opacity-70 transition-colors duration-700",
                  isConnected && isSpeaking ? "bg-amber-500 animate-pulse" :
                  isConnected ? "bg-emerald-600" :
                  isConnecting ? "bg-amber-600 animate-pulse" :
                  "bg-zinc-700"
                )} />
                <div className={cn(
                  "absolute inset-6 rounded-full blur-md opacity-80 transition-colors duration-700",
                  isConnected && isSpeaking ? "bg-orange-400" :
                  isConnected ? "bg-teal-400" :
                  "bg-zinc-600"
                )} />

                {/* Center icon */}
                <div className="relative z-30">
                  {isConnecting ? (
                    <Loader2 className="h-8 w-8 text-amber-300 animate-spin" />
                  ) : isConnected && isSpeaking ? (
                    <Volume2 className="h-8 w-8 text-amber-200 animate-pulse" />
                  ) : isConnected ? (
                    <Mic className="h-8 w-8 text-emerald-200 animate-pulse" />
                  ) : (
                    <Mic className="h-8 w-8 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Waveform bars below orb */}
              <div className="absolute -bottom-8 flex gap-1 items-end h-8">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-all duration-300 origin-bottom",
                      isConnected && isSpeaking
                        ? "bg-amber-400"
                        : isConnected
                        ? "bg-emerald-500"
                        : "bg-zinc-400/40"
                    )}
                    style={{
                      height: isConnected ? `${Math.random() * 20 + 6}px` : "4px",
                      animationName: isConnected ? "wave-bar" : "none",
                      animationDuration: `${0.4 + i * 0.07}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Call Button */}
            <div className="flex flex-col items-center gap-3 mt-4">
              {!isConnected && !isConnecting ? (
                <button
                  onClick={startSession}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 text-sm font-semibold shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all duration-200"
                >
                  <Phone className="h-4 w-4" />
                  Start Conversation
                </button>
              ) : isConnecting ? (
                <button disabled className="flex items-center gap-2 rounded-full bg-amber-600/70 text-white px-8 py-3 text-sm font-semibold cursor-not-allowed opacity-80">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 text-sm font-semibold shadow-lg shadow-rose-600/30 hover:scale-105 transition-all duration-200"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Session
                </button>
              )}

              {permissionError && (
                <p className="text-xs text-rose-500 dark:text-rose-400 text-center max-w-xs">
                  Microphone permission denied. Please allow mic access in your browser and try again.
                </p>
              )}

              {convStatus === "error" && !permissionError && (
                <p className="text-xs text-rose-500 dark:text-rose-400 text-center max-w-xs">
                  Connection failed. Check that your ElevenLabs agent is published and the API key has convai_write permission.
                </p>
              )}
            </div>

          </div>

          {/* Live Transcript */}
          {transcript.length > 0 && (
            <div className="rounded-2xl bg-white/60 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Activity className="h-3 w-3" /> Live Transcript
              </h4>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {transcript.map((t, i) => (
                  <div key={i} className={cn(
                    "flex max-w-[85%] rounded-2xl px-3 py-2 text-xs",
                    t.role === "user"
                      ? "self-end bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none ml-auto"
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-none mr-auto border border-zinc-100 dark:border-white/5"
                  )}>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Goal Card */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-500" />
              UPF Barcelona SMC Goal
            </h4>
            <div className="space-y-3 text-xs">
              {[
                ["Degree", "MSc Sound & Music AI"],
                ["Target intake", "Barcelona, Spain"],
                ["Language Tutoring", "70% EN / 30% ES"],
                ["Current Task", "IELTS Prep & Audio Projects"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2 last:border-0">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    {label === "Language Tutoring" && <Languages className="h-3 w-3 text-emerald-500" />}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Commands */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" />
              Quick Starters
            </h4>
            <p className="text-[10px] text-zinc-500 mb-3">Start a session, then say one of these:</p>
            <div className="space-y-2">
              {QUICK_COMMANDS.map((q) => (
                <div
                  key={q.command}
                  className="w-full flex items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 border border-zinc-200/60 dark:border-white/5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span className="italic text-zinc-500 dark:text-zinc-400">&ldquo;{q.label}&rdquo;</span>
                  <ArrowRight className="h-3 w-3 text-zinc-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>

            {/* Agent Info */}
            <div className="mt-4 border-t border-zinc-100 dark:border-white/5 pt-3">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <Terminal className="h-3 w-3" /> Agent Info
              </h5>
              <div className="rounded-lg bg-zinc-950 dark:bg-black p-2 font-mono text-[9px] text-zinc-400 space-y-1 border border-zinc-800">
                <div><span className="text-indigo-400">[agent]</span> {AGENT_ID.slice(0, 28)}...</div>
                <div><span className="text-emerald-400">[voice]</span> ElevenLabs · Daniel (EN) / Álvaro (ES)</div>
                <div><span className="text-amber-400">[llm]</span> OpenRouter / GLM via ElevenLabs</div>
                <div><span className="text-zinc-500">[transport]</span> WebSocket · Browser-native</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SenseiPage() {
  return (
    <ConversationProvider>
      <SenseiInner />
    </ConversationProvider>
  );
}
