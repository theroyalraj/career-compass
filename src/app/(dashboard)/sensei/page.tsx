"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Sparkles, Mic, Volume2, Flame, Bot, GraduationCap, 
  BookOpen, Terminal, ShieldAlert, Languages, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type SenseiEvent = {
  type: "daemon_start" | "listening" | "heard" | "thinking" | "reply" | "error" | string;
  text?: string;
  ts: number;
};

export default function SenseiPage() {
  const [status, setStatus] = useState<"connecting" | "listening" | "thinking" | "speaking" | "offline">("connecting");
  const [events, setEvents] = useState<SenseiEvent[]>([]);
  const [activeSpeech, setActiveSpeech] = useState<string>("Sensei is ready to assist you. Speak out loud.");
  const [spokenHistory, setSpokenHistory] = useState<{ role: "user" | "sensei", text: string }[]>([]);
  
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      setStatus("connecting");
      es = new EventSource("http://localhost:3847/voice/stream");

      es.onopen = () => {
        setStatus("listening");
      };

      es.onerror = () => {
        setStatus("offline");
        es?.close();
        reconnectTimeout = setTimeout(connect, 5000);
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const newEvent: SenseiEvent = {
            type: data.type,
            text: data.text,
            ts: data.ts || Date.now(),
          };

          setEvents((prev) => [...prev.slice(-20), newEvent]);

          if (newEvent.type === "listening" || newEvent.type === "daemon_start") {
            setStatus("listening");
          } else if (newEvent.type === "thinking") {
            setStatus("thinking");
            setActiveSpeech("Thinking...");
          } else if (newEvent.type === "heard" && newEvent.text) {
            setStatus("thinking");
            setActiveSpeech(`"${newEvent.text}"`);
            setSpokenHistory((prev) => [...prev, { role: "user", text: newEvent.text! }]);
          } else if (newEvent.type === "reply" && newEvent.text) {
            setStatus("speaking");
            setActiveSpeech(newEvent.text);
            setSpokenHistory((prev) => [...prev, { role: "sensei", text: newEvent.text! }]);
          } else if (newEvent.type === "error") {
            setStatus("offline");
            setActiveSpeech(newEvent.text || "An error occurred.");
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };
    }

    connect();

    return () => {
      es?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  // Quick action command injection
  const triggerCommand = async (text: string) => {
    if (status === "connecting" || status === "offline") return;
    setStatus("thinking");
    setActiveSpeech(`"${text}"`);
    setSpokenHistory((prev) => [...prev, { role: "user", text }]);

    try {
      const response = await fetch("http://localhost:3847/voice/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer generate-a-long-random-string"
        },
        body: JSON.stringify({
          text,
          userId: "sensei-web-ui",
          source: "web"
        })
      });

      if (!response.ok) throw new Error("Agent failed");
      const data = await response.json();
      setStatus("speaking");
      setActiveSpeech(data.summary);
      setSpokenHistory((prev) => [...prev, { role: "sensei", text: data.summary }]);
    } catch (e) {
      setStatus("offline");
      setActiveSpeech("Failed to reach Sensei. Is pc-agent running?");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] w-full overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950 p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl transition-all duration-300">
      {/* Mesh Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(240,244,255,1)_0%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,16,28,1)_0%,rgba(5,5,10,1)_100%)] transition-colors duration-300" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] transition-colors duration-300" />

      {/* Main Grid Layout */}
      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Side: Siri Glowing Core & Live Transcript (Main Arena) */}
        <div className="lg:col-span-8 flex flex-col justify-between min-h-[550px] p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md transition-all duration-300">
          {/* Top Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Sensei AI Tutor Core</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-300",
              status === "listening" ? "bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
              status === "thinking" ? "bg-indigo-100/60 dark:bg-indigo-950/40 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
              status === "speaking" ? "bg-amber-100/60 dark:bg-amber-950/40 border-amber-500/20 text-amber-600 dark:text-amber-400" :
              "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400"
            )}>
              <span className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                status === "listening" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" :
                status === "thinking" ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-ping" :
                status === "speaking" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-bounce" :
                "bg-zinc-400 dark:bg-zinc-500"
              )} />
              {status === "listening" ? "Always-On Listening" :
               status === "thinking" ? "Processing Thought..." :
               status === "speaking" ? "Speaking..." :
               status === "offline" ? "Disconnected" : "Connecting..."}
            </div>
          </div>

          {/* Central AI Glowing Energy Core (Realistic 3D Fluid Orb UX) */}
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="relative flex h-72 w-72 items-center justify-center orb-hover">
              
              {/* Injecting CSS Keyframes directly for the dynamic fluid orb */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes aura-pulse {
                  0%, 100% { transform: scale(1.1); opacity: 0.25; }
                  50% { transform: scale(1.18); opacity: 0.38; }
                }
                @keyframes orb-rotate {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes orb-fluid {
                  0%, 100% { border-radius: 43% 57% 65% 35% / 40% 45% 55% 60%; }
                  33% { border-radius: 65% 35% 50% 50% / 55% 40% 60% 45%; }
                  66% { border-radius: 50% 50% 35% 65% / 45% 60% 40% 55%; }
                }
                .orb-hover {
                  animation: float 6s ease-in-out infinite;
                }
                .orb-aura {
                  animation: aura-pulse 4s ease-in-out infinite;
                }
                .orb-layer {
                  animation: orb-fluid 8s ease-in-out infinite, orb-rotate 15s linear infinite;
                }
                .orb-layer-2 {
                  animation: orb-fluid 10s ease-in-out infinite alternate, orb-rotate 22s linear infinite reverse;
                }
                .orb-layer-3 {
                  animation: orb-fluid 7s ease-in-out infinite, orb-rotate 12s linear infinite;
                }
                .orb-layer-4 {
                  animation: orb-fluid 9s ease-in-out infinite alternate-reverse, orb-rotate 18s linear infinite;
                }
              `}} />

              {/* Outer Glowing Space Aura */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-3xl opacity-35 transition-all duration-1000 scale-110 orb-aura",
                status === "listening" ? "bg-emerald-400 dark:bg-emerald-500" :
                status === "thinking" ? "bg-indigo-400 dark:bg-indigo-500" :
                status === "speaking" ? "bg-amber-400 dark:bg-amber-500" :
                "bg-zinc-300 dark:bg-zinc-800"
              )} />

              {/* Outer Orbit Rings */}
              <div className="absolute h-64 w-64 rounded-full border border-zinc-200 dark:border-white/5 opacity-50 scale-105" />
              
              <div className={cn(
                "absolute h-60 w-60 rounded-full border border-dashed border-zinc-300 dark:border-white/10 transition-transform duration-10000",
                status === "thinking" ? "animate-[spin_6s_linear_infinite]" : "animate-[spin_30s_linear_infinite]"
              )} />

              <div className={cn(
                "absolute h-54 w-54 rounded-full border border-dotted border-zinc-400/40 dark:border-white/20 animate-[spin_18s_linear_infinite_reverse]"
              )} />

              {/* Orbiting Spark micro-particles */}
              <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
                <div className={cn(
                  "absolute top-4 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full blur-[0.5px] transition-colors duration-1000 shadow-md",
                  status === "listening" ? "bg-emerald-400 shadow-emerald-400/50" :
                  status === "thinking" ? "bg-indigo-400 shadow-indigo-400/50" :
                  status === "speaking" ? "bg-amber-400 shadow-amber-400/50" :
                  "bg-zinc-400"
                )} />
              </div>

              <div className="absolute inset-0 animate-[spin_16s_linear_infinite_reverse]">
                <div className={cn(
                  "absolute bottom-4 left-1/3 h-1.5 w-1.5 rounded-full blur-[0.5px] transition-colors duration-1000 shadow-md",
                  status === "listening" ? "bg-teal-300 shadow-teal-300/50" :
                  status === "thinking" ? "bg-purple-400 shadow-purple-400/50" :
                  status === "speaking" ? "bg-orange-400 shadow-orange-400/50" :
                  "bg-zinc-400"
                )} />
              </div>

              {/* The Realistic 3D Glowing Glass Orb */}
              <div className={cn(
                "relative z-10 flex h-48 w-48 items-center justify-center rounded-full shadow-2xl transition-all duration-500 border border-zinc-200/80 dark:border-white/10",
                "bg-zinc-900/90 dark:bg-zinc-950/40 backdrop-blur-xl overflow-hidden",
                status === "listening" && "shadow-emerald-500/20 dark:shadow-emerald-500/30 border-emerald-400/50 dark:border-emerald-500/20 scale-105",
                status === "thinking" && "shadow-indigo-500/20 dark:shadow-indigo-500/40 border-indigo-400/50 dark:border-indigo-500/20 scale-110",
                status === "speaking" && "shadow-amber-500/20 dark:shadow-amber-500/30 border-amber-400/50 dark:border-amber-500/20 scale-105",
                (status === "offline" || status === "connecting") && "shadow-zinc-400/10 dark:shadow-zinc-950/20 scale-100"
              )}>
                
                {/* 3D Glass Gloss Overlay (Deepens the 3D shape) */}
                <div className="absolute inset-0 z-30 pointer-events-none rounded-full" 
                     style={{
                       background: "radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 40%)"
                     }} />

                {/* Layered fluid energy blobs inside the glass sphere */}
                <div className={cn(
                  "orb-layer absolute inset-2 rounded-full blur-md mix-blend-screen opacity-70 transition-colors duration-1000",
                  status === "listening" ? "bg-emerald-600" :
                  status === "thinking" ? "bg-indigo-600" :
                  status === "speaking" ? "bg-amber-600" :
                  "bg-zinc-800"
                )} />

                <div className={cn(
                  "orb-layer-2 absolute inset-4 rounded-full blur-lg mix-blend-screen opacity-85 transition-colors duration-1000",
                  status === "listening" ? "bg-teal-500" :
                  status === "thinking" ? "bg-purple-600" :
                  status === "speaking" ? "bg-orange-500" :
                  "bg-zinc-700"
                )} />

                <div className={cn(
                  "orb-layer-3 absolute inset-8 rounded-full blur-sm mix-blend-screen opacity-90 transition-colors duration-1000",
                  status === "listening" ? "bg-cyan-300" :
                  status === "thinking" ? "bg-indigo-300" :
                  status === "speaking" ? "bg-yellow-300" :
                  "bg-zinc-600"
                )} />

                <div className={cn(
                  "orb-layer-4 absolute inset-6 rounded-full blur-md mix-blend-screen opacity-75 transition-colors duration-1000",
                  status === "listening" ? "bg-emerald-400" :
                  status === "thinking" ? "bg-pink-500" :
                  status === "speaking" ? "bg-red-500" :
                  "bg-zinc-700"
                )} />

                {/* Inner Ambient Glow center */}
                <div className="absolute inset-0 z-20 rounded-full border border-white/5" 
                     style={{
                       background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.65) 90%)"
                     }} />

                {/* Subtle Core Flare (Pure ambient glass glow, no hard static icons) */}
                <div className="relative z-40 transition-all duration-500 scale-100 opacity-65">
                  <div className={cn(
                    "h-6 w-6 rounded-full blur-md animate-pulse transition-all duration-500",
                    status === "speaking" ? "bg-white/80 shadow-[0_0_12px_white]" :
                    status === "thinking" ? "bg-indigo-300/80 shadow-[0_0_12px_rgba(165,180,252,1)]" :
                    status === "listening" ? "bg-emerald-300/80 shadow-[0_0_12px_rgba(167,243,208,1)]" :
                    "bg-zinc-700/80"
                  )} />
                </div>
              </div>

              {/* Siri-style waveform at the bottom */}
              <div className="absolute -bottom-6 flex gap-1 h-8 items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => (
                  <div
                    key={bar}
                    className={cn(
                      "w-1 rounded-full transition-all duration-300",
                      status === "listening" ? "bg-emerald-500 dark:bg-emerald-400" :
                      status === "thinking" ? "bg-indigo-500 dark:bg-indigo-400 animate-pulse" :
                      status === "speaking" ? "bg-amber-500 dark:bg-amber-400" :
                      "bg-zinc-400 dark:bg-zinc-700",
                      status === "speaking" ? `h-${Math.floor(Math.random() * 6) + 2}` : "h-2"
                    )}
                    style={{
                      height: status === "speaking" ? `${Math.floor(Math.random() * 24) + 8}px` : 
                              status === "listening" ? `${Math.floor(Math.random() * 12) + 4}px` : "6px",
                      animationDelay: `${bar * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subtitles Overlay (Live Speech) */}
          <div className="w-full border-t border-zinc-200 dark:border-white/5 pt-4 text-center">
            <p className={cn(
              "text-lg font-medium leading-relaxed transition-all duration-300 px-4",
              status === "speaking" ? "text-amber-600 dark:text-amber-200 font-semibold" :
              status === "thinking" ? "text-indigo-600 dark:text-indigo-300 italic font-semibold" :
              status === "listening" ? "text-emerald-600 dark:text-emerald-100 font-semibold" : "text-zinc-500 dark:text-zinc-400"
            )}>
              {activeSpeech}
            </p>
          </div>
        </div>

        {/* Right Side: Goals, Spanish Cards & Live Logs */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          
          {/* Active Context Card */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md transition-all duration-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              UPF Barcelona SMC Goal
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                <span className="text-zinc-500">Degree</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">MSc Sound & Music AI</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                <span className="text-zinc-500">Target intake</span>
                <span className="font-semibold text-orange-500 dark:text-orange-400">Barcelona, Spain</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                <span className="text-zinc-500">Language Tutoring</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5" />
                  70% EN / 30% ES
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Current Task</span>
                <span className="font-semibold text-indigo-500 dark:text-indigo-400">IELTS Prep & Audio Projects</span>
              </div>
            </div>
          </div>

          {/* Quick Interactive Spanish Trigger Cards */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-white/5 backdrop-blur-md flex-1 flex flex-col justify-between transition-all duration-300">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                Spanish Conversation Triggers
              </h4>
              <p className="text-[11px] text-zinc-500 mb-4">
                Click any of these shortcut commands to inject it immediately to Sensei:
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => triggerCommand("Hola Sensei, enséñame una palabra nueva en español")}
                  className="w-full flex items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 border border-zinc-200/60 dark:border-white/5 px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                >
                  <span>"Hola Sensei, enséñame español..."</span>
                  <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => triggerCommand("Give me an audio engineering quiz in Spanish")}
                  className="w-full flex items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 border border-zinc-200/60 dark:border-white/5 px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                >
                  <span>"Give me an audio quiz in Spanish..."</span>
                  <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => triggerCommand("Test my Barcelona MSc SMC requirements")}
                  className="w-full flex items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 border border-zinc-200/60 dark:border-white/5 px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                >
                  <span>"Test my Barcelona MSc plans..."</span>
                  <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* SSE Terminal Logs */}
            <div className="mt-4 border-t border-zinc-200 dark:border-white/5 pt-4">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                <Terminal className="h-3 w-3" />
                Live Event Bus
              </h5>
              <div className="h-36 overflow-y-auto rounded-lg bg-zinc-950 p-2 font-mono text-[9px] text-zinc-300 dark:text-zinc-400 space-y-1 scrollbar-thin border border-zinc-200 dark:border-zinc-800 shadow-inner">
                {events.length === 0 ? (
                  <div className="text-zinc-500 text-center py-8">Waiting for audio daemon...</div>
                ) : (
                  events.slice(-6).map((ev, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-indigo-400">[{ev.type}]</span>
                      <span className="text-zinc-300 truncate">{ev.text || "OK"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
