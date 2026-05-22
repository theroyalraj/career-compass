"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles, Mic, Volume2, X, Terminal, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type SenseiEvent = {
  type: "daemon_start" | "listening" | "heard" | "thinking" | "reply" | "error" | string;
  text?: string;
  ts: number;
};

export function SenseiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"connecting" | "listening" | "thinking" | "speaking" | "offline">("connecting");
  const [events, setEvents] = useState<SenseiEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new events arrive
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events, isOpen]);

  useEffect(() => {
    // Connect to SSE stream served by pc-agent on port 3847
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      setStatus("connecting");
      es = new EventSource("http://localhost:3847/voice/stream");

      es.onopen = () => {
        setStatus("listening");
        console.log("[SenseiWidget] EventSource connected successfully!");
      };

      es.onerror = () => {
        setStatus("offline");
        es?.close();
        // Retry connection every 5 seconds
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

          setEvents((prev) => [...prev.slice(-30), newEvent]); // Keep last 30 events

          // Update widget state based on event type
          if (newEvent.type === "listening" || newEvent.type === "daemon_start") {
            setStatus("listening");
          } else if (newEvent.type === "thinking") {
            setStatus("thinking");
          } else if (newEvent.type === "reply") {
            setStatus("speaking");
          } else if (newEvent.type === "error") {
            setStatus("offline");
          }

          // Trigger unread indicator if closed
          if (!isOpen && ["heard", "reply", "error"].includes(newEvent.type)) {
            setUnreadCount((c) => c + 1);
          }
        } catch (err) {
          console.error("[SenseiWidget] Failed to parse event data:", err);
        }
      };
    }

    connect();

    return () => {
      es?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
  };

  // Get status details (glowing color & display text)
  const getStatusConfig = () => {
    switch (status) {
      case "listening":
        return { color: "bg-emerald-500 shadow-emerald-500/40", text: "Ready & Listening" };
      case "thinking":
        return { color: "bg-indigo-500 shadow-indigo-500/40 animate-pulse", text: "Sensei is thinking..." };
      case "speaking":
        return { color: "bg-amber-500 shadow-amber-500/40 animate-bounce", text: "Sensei is speaking" };
      case "offline":
        return { color: "bg-rose-500 shadow-rose-500/40", text: "Sensei offline" };
      case "connecting":
      default:
        return { color: "bg-zinc-500 shadow-zinc-500/40 animate-pulse", text: "Connecting..." };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200/80 dark:border-white/10 text-white transition-all duration-300 shadow-2xl hover:scale-105",
          status === "thinking" ? "bg-gradient-to-tr from-indigo-600 to-purple-600" :
          status === "speaking" ? "bg-gradient-to-tr from-amber-500 to-orange-600" :
          status === "listening" ? "bg-gradient-to-tr from-emerald-600 to-teal-600" :
          "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-750"
        )}
      >
        {status === "speaking" ? (
          <Volume2 className="h-6 w-6 animate-pulse" />
        ) : status === "thinking" ? (
          <Sparkles className="h-6 w-6 animate-spin duration-3000" />
        ) : (
          <Mic className={cn("h-6 w-6", status === "listening" && "animate-pulse")} />
        )}

        {/* Outer Pulsing Glow */}
        {status === "listening" && (
          <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-emerald-500/20 opacity-75" />
        )}
        {status === "thinking" && (
          <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-indigo-500/20 opacity-75" />
        )}

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
            {unreadCount}
          </span>
        )}

        {/* Simple Status Dot on the button */}
        <span className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-zinc-100 dark:border-zinc-950 transition-colors duration-300", statusConfig.color)} />
      </button>

      {/* Expanded Log Panel */}
      <div
        className={cn(
          "absolute bottom-20 right-0 w-[380px] rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-4 shadow-2xl transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Sensei Tutor</h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-450">Multilingual Audio Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-300">
              <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.color)} />
              {statusConfig.text}
            </div>
            <button
              onClick={handleToggle}
              className="rounded-lg p-1 text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Speech Logs */}
        <div className="mt-3 flex h-[280px] flex-col overflow-y-auto rounded-xl bg-zinc-50 dark:bg-black/40 p-3 border border-zinc-100 dark:border-none shadow-inner scrollbar-thin">
          {events.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Terminal className="h-8 w-8 text-zinc-400 dark:text-zinc-700 animate-pulse mb-2" />
              <p className="text-xs text-zinc-500 dark:text-zinc-450">No voice activities captured yet.</p>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-650 mt-1">Start speaking to active Sensei daemon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev, index) => {
                const isUser = ev.type === "heard";
                const isReply = ev.type === "reply";
                const isErr = ev.type === "error";

                if (!ev.text) return null;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-2xl px-3 py-2 text-xs transition-all duration-300",
                      isUser
                        ? "self-end bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none ml-auto shadow-sm"
                        : isReply
                        ? "bg-white dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 rounded-bl-none mr-auto border border-zinc-100 dark:border-white/5 shadow-sm"
                        : isErr
                        ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-500/20 mr-auto shadow-sm"
                        : "bg-zinc-100/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 max-w-full text-center mx-auto text-[10px]"
                    )}
                  >
                    {!isUser && !isReply && !isErr && (
                      <span className="font-semibold uppercase tracking-wider text-[8px] text-zinc-500 dark:text-zinc-450 block mb-0.5">
                        {ev.type}
                      </span>
                    )}
                    <span>{ev.text}</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-600 px-1">
          <span>Target: UPF Barcelona SMC</span>
          <span>70% EN / 30% ES</span>
        </div>
      </div>
    </div>
  );
}
