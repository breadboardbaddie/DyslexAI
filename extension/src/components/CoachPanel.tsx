import React, { useState, useRef, useEffect } from "react";
import { TutorTurn, createMessage, sendToBackground, TutorResponsePayload } from "../utils/messages";

interface Props {
  regionText: string;
  onClose: () => void;
}

export function CoachPanel({ regionText, onClose }: Props) {
  const [history, setHistory] = useState<TutorTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track whether the user has started a conversation (prevents welcome screen
  // from flickering back during loading or after errors)
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

    const msg = createMessage("TUTOR_MESSAGE", {
      regionText,
      conversationHistory: history,
      userMessage,
      mode,
    });

    try {
      const response = await sendToBackground(msg) as TutorResponsePayload;
      if (response?.conversationHistory) {
        setHistory(response.conversationHistory);
      } else {
        setError("No response from Coach. Make sure your API key is set in settings.");
      }
    } catch {
      setError("Couldn't reach Coach. Check your Claude API key in DyslexAI settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    sendMessage(msg, "open");
  }

  function handleSocratic() {
    sendMessage("", "socratic");
  }

  function dismissError() {
    setError(null);
    // If nothing was sent successfully yet, let them try again
    if (history.length === 0) setStarted(false);
  }

  // Inline all styles to prevent page CSS interference
  const s = (style: React.CSSProperties): React.CSSProperties => style;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={s({
        position: "fixed",
        top: 0,
        right: 0,
        width: 360,
        height: "100vh",
        zIndex: 2147483644,
        background: "#f8f9ff",
        borderLeft: "2px solid #d0d8ff",
        boxShadow: "-4px 0 24px rgba(80,80,200,0.10)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 14,
        color: "#333",
        lineHeight: "1.5",
        boxSizing: "border-box",
      })}
    >
      {/* Header */}
      <div style={s({
        padding: "14px 16px 12px",
        borderBottom: "1px solid #e0e4ff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        flexShrink: 0,
      })}>
        <div>
          <div style={s({ fontWeight: 700, fontSize: 15, color: "#2d3a8c" })}>🎓 Coach</div>
          <div style={s({ fontSize: 11, color: "#aaa", marginTop: 1 })}>Powered by Claude AI</div>
        </div>
        <button
          onClick={onClose}
          style={s({ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#bbb", lineHeight: "1", padding: "2px 4px" })}
          aria-label="Close"
        >×</button>
      </div>

      {/* Context snippet */}
      <div style={s({
        margin: "10px 12px 0",
        padding: "8px 12px",
        background: "#eef2ff",
        borderRadius: 8,
        fontSize: 12,
        color: "#555",
        borderLeft: "3px solid #4a90d9",
        flexShrink: 0,
        overflow: "hidden",
        maxHeight: 72,
      })}>
        <span style={s({ fontWeight: 600, color: "#2d3a8c" })}>Detected: </span>
        {regionText.slice(0, 180)}{regionText.length > 180 ? "…" : ""}
      </div>

      {/* Conversation area */}
      <div style={s({ flex: 1, overflowY: "auto", padding: "12px" })}>

        {/* Welcome screen — only show if not started yet */}
        {!started && history.length === 0 && !loading && (
          <div style={s({ textAlign: "center", padding: "24px 8px" })}>
            <div style={s({ fontSize: 28, marginBottom: 8 })}>👋</div>
            <div style={s({ fontWeight: 700, color: "#2d3a8c", fontSize: 15, marginBottom: 6 })}>Hi! I'm Coach.</div>
            <div style={s({ color: "#666", fontSize: 13, marginBottom: 20, lineHeight: "1.6" })}>
              Ask me anything about this, or let me ask you a question to get started.
            </div>
            <button
              onClick={handleSocratic}
              style={s({
                background: "#4a90d9",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                boxShadow: "0 2px 8px rgba(74,144,217,0.3)",
                display: "block",
                width: "100%",
                marginBottom: 8,
              })}
            >
              Guide me with a question →
            </button>
            <div style={s({ color: "#aaa", fontSize: 11 })}>or type your own question below</div>
          </div>
        )}

        {/* Conversation history */}
        {history.map((turn, i) => (
          <div key={i} style={s({ marginBottom: 10 })}>
            {turn.role === "user" ? (
              <div style={s({ display: "flex", justifyContent: "flex-end" })}>
                <div style={s({
                  background: "#4a90d9",
                  color: "#fff",
                  borderRadius: "12px 12px 2px 12px",
                  padding: "8px 12px",
                  maxWidth: "80%",
                  fontSize: 13,
                  lineHeight: "1.5",
                  fontFamily: "system-ui, sans-serif",
                })}>{turn.content}</div>
              </div>
            ) : (
              <div style={s({ display: "flex", justifyContent: "flex-start" })}>
                <div style={s({
                  background: "#fff",
                  color: "#333",
                  borderRadius: "12px 12px 12px 2px",
                  padding: "10px 12px",
                  maxWidth: "85%",
                  fontSize: 13,
                  lineHeight: "1.6",
                  border: "1px solid #e0e4ff",
                  boxShadow: "0 1px 4px rgba(74,144,217,0.07)",
                  fontFamily: "system-ui, sans-serif",
                })}>{turn.content}</div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={s({ display: "flex", justifyContent: "flex-start", marginBottom: 10 })}>
            <div style={s({
              background: "#fff",
              borderRadius: "12px 12px 12px 2px",
              padding: "10px 14px",
              fontSize: 13,
              color: "#aaa",
              border: "1px solid #e0e4ff",
              fontFamily: "system-ui, sans-serif",
            })}>Coach is thinking…</div>
          </div>
        )}

        {/* Error — dismissable, always recoverable */}
        {error && (
          <div style={s({
            background: "#fff8f0",
            border: "1px solid #ffd0a0",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
            color: "#b05000",
            marginBottom: 8,
            fontFamily: "system-ui, sans-serif",
          })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 })}>
              <span>{error}</span>
              <button
                onClick={dismissError}
                style={s({ background: "none", border: "none", cursor: "pointer", color: "#b05000", fontSize: 16, lineHeight: "1", flexShrink: 0 })}
              >×</button>
            </div>
          </div>
        )}

        {/* "Ask another question" button after conversation starts */}
        {started && history.length > 0 && !loading && (
          <button
            onClick={handleSocratic}
            style={s({
              background: "none",
              border: "1px solid #d0d8ff",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              color: "#4a90d9",
              fontFamily: "system-ui, sans-serif",
              marginTop: 4,
            })}
          >
            Ask me a guiding question →
          </button>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        style={s({ padding: "12px", borderTop: "1px solid #e0e4ff", background: "#fff", flexShrink: 0 })}
      >
        <div style={s({ display: "flex", gap: 8 })}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={loading}
            style={s({
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1.5px solid #d0d8ff",
              fontSize: 13,
              outline: "none",
              background: loading ? "#f8f8f8" : "#fff",
              fontFamily: "system-ui, sans-serif",
              color: "#333",
              boxSizing: "border-box",
            })}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={s({
              background: loading || !input.trim() ? "#c8d8f0" : "#4a90d9",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0 16px",
              cursor: loading || !input.trim() ? "default" : "pointer",
              fontSize: 18,
              fontFamily: "system-ui, sans-serif",
            })}
          >→</button>
        </div>
      </form>
    </div>
  );
}
