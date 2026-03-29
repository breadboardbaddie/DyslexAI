import React, { useState, useRef, useEffect } from "react";
import { TutorTurn, TutorMessagePayload, TutorResponsePayload } from "../utils/messages";
import { getSettings } from "../utils/storage";

const SYSTEM_PROMPT = `You are Coach, a warm, patient, and encouraging math tutor built into a web browser accessibility tool. Your users have dyscalculia, dyslexia, math anxiety, or other learning differences. They may feel embarrassed or anxious asking for help.

Your rules:
- NEVER shame or judge. Always be encouraging.
- Break problems into the SMALLEST possible steps.
- Ask only ONE question at a time in Socratic mode.
- In open mode, answer the user's question directly but gently, then check understanding.
- Never give the full answer until the user has worked through it with you, unless they explicitly ask.
- Use simple language. Avoid jargon. If you must use a math term, explain it immediately.
- Use visual analogies when helpful (e.g., "imagine you have 5 apples...").
- Keep responses SHORT — 2–4 sentences maximum per turn.
- Always end with either a question or a gentle encouragement.`;

const FALLBACK_QUESTIONS = [
  "Let's slow down and break it apart. What do you think this is asking you to find?",
  "What part of this feels most confusing right now? Try to point at just one thing.",
  "Can you put this problem into your own words — as if explaining it to a friend?",
  "What information do you already have? Let's list what we know first.",
  "If you had to guess a first step, what would it be? There's no wrong answer here.",
];
let fallbackIdx = 0;
function nextFallback() {
  return FALLBACK_QUESTIONS[fallbackIdx++ % FALLBACK_QUESTIONS.length];
}

// Use a long-lived port to call the background service worker.
// Ports keep the worker alive for the duration of the call and avoid CORS —
// background workers can fetch api.anthropic.com, content scripts cannot.
function callTutorViaPort(payload: TutorMessagePayload): Promise<TutorResponsePayload> {
  return new Promise((resolve, reject) => {
    const port = chrome.runtime.connect({ name: "dyslexai-tutor" });
    const timeout = setTimeout(() => {
      port.disconnect();
      reject(new Error("Timed out waiting for Coach response (30s)"));
    }, 30000);

    port.onMessage.addListener((msg: { ok: boolean; result?: TutorResponsePayload; error?: string }) => {
      clearTimeout(timeout);
      port.disconnect();
      if (msg.ok && msg.result) {
        resolve(msg.result);
      } else {
        reject(new Error(msg.error ?? "Unknown error from background"));
      }
    });

    port.onDisconnect.addListener(() => {
      clearTimeout(timeout);
      reject(new Error("Background port disconnected unexpectedly"));
    });

    port.postMessage(payload);
  });
}

interface Props {
  regionText: string;
  onClose: () => void;
}

export function CoachPanel({ regionText, onClose }: Props) {
  const [history, setHistory] = useState<TutorTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function sendMessage(userMessage: string, mode: "open" | "socratic") {
    if (loading) return;
    setStarted(true);
    setLoading(true);
    setError(null);

    const settings = await getSettings();
    const apiKey = settings.coachMode.apiKey?.trim();

    // No API key — use fallback question, no error shown
    if (!apiKey) {
      appendTurns(userMessage, nextFallback(), mode);
      setLoading(false);
      return;
    }

    const payload: TutorMessagePayload = {
      regionText,
      conversationHistory: history,
      userMessage,
      mode,
      apiKey,
    };

    try {
      const response = await callTutorViaPort(payload);
      appendTurns(userMessage, response.reply, mode);
    } catch (err) {
      console.error("[DyslexAI Coach]", err);
      const msg = err instanceof Error ? err.message : String(err);
      appendTurns(userMessage, nextFallback(), mode);
      setError(`Claude error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function appendTurns(userMessage: string, reply: string, mode: "open" | "socratic") {
    setHistory((prev) => [
      ...prev,
      ...(userMessage.trim() ? [{ role: "user" as const, content: userMessage, mode }] : []),
      { role: "assistant" as const, content: reply, mode },
    ]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    sendMessage(msg, "open");
  }

  function dismissError() {
    setError(null);
    if (history.length === 0) setStarted(false);
  }

  const s = (style: React.CSSProperties): React.CSSProperties => style;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={s({
        position: "fixed", top: 0, right: 0, width: 360, height: "100vh",
        zIndex: 2147483644, background: "#f8f9ff",
        borderLeft: "2px solid #d0d8ff",
        boxShadow: "-4px 0 24px rgba(80,80,200,0.10)",
        display: "flex", flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 14, color: "#333", lineHeight: "1.5", boxSizing: "border-box",
      })}
    >
      {/* Header */}
      <div style={s({
        padding: "14px 16px 12px", borderBottom: "1px solid #e0e4ff",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#fff", flexShrink: 0,
      })}>
        <div>
          <div style={s({ fontWeight: 700, fontSize: 15, color: "#2d3a8c" })}>🎓 Coach</div>
          <div style={s({ fontSize: 11, color: "#aaa", marginTop: 1 })}>Powered by Claude AI</div>
        </div>
        <button onClick={onClose}
          style={s({ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#bbb", lineHeight: "1", padding: "2px 4px" })}
          aria-label="Close">×</button>
      </div>

      {/* Context snippet */}
      <div style={s({
        margin: "10px 12px 0", padding: "8px 12px", background: "#eef2ff",
        borderRadius: 8, fontSize: 12, color: "#555", borderLeft: "3px solid #4a90d9",
        flexShrink: 0, overflow: "hidden", maxHeight: 72,
      })}>
        <span style={s({ fontWeight: 600, color: "#2d3a8c" })}>Detected: </span>
        {regionText.slice(0, 180)}{regionText.length > 180 ? "…" : ""}
      </div>

      {/* Conversation */}
      <div style={s({ flex: 1, overflowY: "auto", padding: "12px" })}>

        {/* Welcome — only before first message */}
        {!started && history.length === 0 && !loading && (
          <div style={s({ textAlign: "center", padding: "24px 8px" })}>
            <div style={s({ fontSize: 28, marginBottom: 8 })}>👋</div>
            <div style={s({ fontWeight: 700, color: "#2d3a8c", fontSize: 15, marginBottom: 6 })}>Hi! I'm Coach.</div>
            <div style={s({ color: "#666", fontSize: 13, marginBottom: 20, lineHeight: "1.6" })}>
              Ask me anything about this, or let me ask you a question to get started.
            </div>
            <button
              onClick={() => sendMessage("", "socratic")}
              style={s({
                background: "#4a90d9", color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                boxShadow: "0 2px 8px rgba(74,144,217,0.3)",
                display: "block", width: "100%", marginBottom: 8,
              })}
            >
              Guide me with a question →
            </button>
            <div style={s({ color: "#aaa", fontSize: 11 })}>or type your own question below</div>
          </div>
        )}

        {/* History */}
        {history.map((turn, i) => (
          <div key={i} style={s({ marginBottom: 10 })}>
            {turn.role === "user" ? (
              <div style={s({ display: "flex", justifyContent: "flex-end" })}>
                <div style={s({
                  background: "#4a90d9", color: "#fff",
                  borderRadius: "12px 12px 2px 12px",
                  padding: "8px 12px", maxWidth: "80%", fontSize: 13,
                  lineHeight: "1.5", fontFamily: "system-ui, sans-serif",
                })}>{turn.content}</div>
              </div>
            ) : (
              <div style={s({ display: "flex", justifyContent: "flex-start" })}>
                <div style={s({
                  background: "#fff", color: "#333",
                  borderRadius: "12px 12px 12px 2px",
                  padding: "10px 12px", maxWidth: "85%", fontSize: 13,
                  lineHeight: "1.6", border: "1px solid #e0e4ff",
                  boxShadow: "0 1px 4px rgba(74,144,217,0.07)",
                  fontFamily: "system-ui, sans-serif",
                })}>{turn.content}</div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={s({ display: "flex", justifyContent: "flex-start", marginBottom: 10 })}>
            <div style={s({
              background: "#fff", borderRadius: "12px 12px 12px 2px",
              padding: "10px 14px", fontSize: 13, color: "#aaa",
              border: "1px solid #e0e4ff", fontFamily: "system-ui, sans-serif",
            })}>Coach is thinking…</div>
          </div>
        )}

        {error && (
          <div style={s({
            background: "#fff8f0", border: "1px solid #ffd0a0", borderRadius: 10,
            padding: "10px 12px", fontSize: 12, color: "#b05000", marginBottom: 8,
            fontFamily: "system-ui, sans-serif",
          })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 })}>
              <span>{error}</span>
              <button onClick={dismissError}
                style={s({ background: "none", border: "none", cursor: "pointer", color: "#b05000", fontSize: 16, lineHeight: "1", flexShrink: 0 })}>×</button>
            </div>
          </div>
        )}

        {/* Socratic button persists mid-conversation */}
        {started && history.length > 0 && !loading && (
          <button
            onClick={() => sendMessage("", "socratic")}
            style={s({
              background: "none", border: "1px solid #d0d8ff", borderRadius: 8,
              padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#4a90d9",
              fontFamily: "system-ui, sans-serif", marginTop: 4,
            })}
          >Ask me a guiding question →</button>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}
        style={s({ padding: "12px", borderTop: "1px solid #e0e4ff", background: "#fff", flexShrink: 0 })}>
        <div style={s({ display: "flex", gap: 8 })}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={loading}
            style={s({
              flex: 1, padding: "10px 12px", borderRadius: 8,
              border: "1.5px solid #d0d8ff", fontSize: 13, outline: "none",
              background: loading ? "#f8f8f8" : "#fff",
              fontFamily: "system-ui, sans-serif", color: "#333", boxSizing: "border-box",
            })}
          />
          <button type="submit" disabled={loading || !input.trim()}
            style={s({
              background: loading || !input.trim() ? "#c8d8f0" : "#4a90d9",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "0 16px", cursor: loading || !input.trim() ? "default" : "pointer",
              fontSize: 18, fontFamily: "system-ui, sans-serif",
            })}>→</button>
        </div>
      </form>
    </div>
  );
}
