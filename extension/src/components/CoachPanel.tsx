import React, { useState, useRef, useEffect } from "react";
import { TutorTurn } from "../utils/messages";
import { createMessage, sendToBackground } from "../utils/messages";
import { TutorResponsePayload } from "../utils/messages";

interface Props {
  regionText: string;
  onClose: () => void;
}

export function CoachPanel({ regionText, onClose }: Props) {
  const [history, setHistory] = useState<TutorTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function sendMessage(userMessage: string, mode: "open" | "socratic") {
    if (loading) return;
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
      setHistory(response.conversationHistory);
    } catch (err) {
      setError("Couldn't reach Coach. Check your API key in settings.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim(), "open");
    setInput("");
  }

  function handleSocratic() {
    sendMessage("Please ask me a guiding question to help me start.", "socratic");
  }

  return (
    <div id="dyslexai-coach-panel">
      {/* Header */}
      <div style={{
        padding: "16px 16px 12px",
        borderBottom: "1px solid #e0e4ff",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#fff",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#2d3a8c" }}>Coach Mode</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Powered by Claude AI</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }} aria-label="Close">×</button>
      </div>

      {/* Context snippet */}
      <div style={{
        margin: "12px 12px 0",
        padding: "10px 12px",
        background: "#eef2ff",
        borderRadius: 8,
        fontSize: 12,
        color: "#444",
        borderLeft: "3px solid #4a90d9",
        maxHeight: 80,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        <strong style={{ color: "#2d3a8c" }}>Looking at: </strong>
        {regionText.slice(0, 200)}{regionText.length > 200 ? "…" : ""}
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {history.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#888", fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>👋</div>
            <div style={{ marginBottom: 12, fontWeight: 600, color: "#555" }}>Hi! I'm Coach.</div>
            <div style={{ marginBottom: 16 }}>Ask me anything about this, or let me guide you with a question.</div>
            <button
              onClick={handleSocratic}
              style={{
                background: "#4a90d9", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600,
              }}
            >
              Guide me with a question →
            </button>
          </div>
        )}

        {history.map((turn, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            {turn.role === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{
                  background: "#4a90d9", color: "#fff", borderRadius: "12px 12px 2px 12px",
                  padding: "8px 12px", maxWidth: "80%", fontSize: 13, lineHeight: 1.5,
                }}>{turn.content}</div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "#fff", color: "#333", borderRadius: "12px 12px 12px 2px",
                  padding: "8px 12px", maxWidth: "85%", fontSize: 13, lineHeight: 1.6,
                  border: "1px solid #e0e4ff", boxShadow: "0 1px 4px rgba(74,144,217,0.07)",
                }}>{turn.content}</div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "#fff", borderRadius: "12px 12px 12px 2px",
              padding: "10px 14px", fontSize: 13, color: "#aaa",
              border: "1px solid #e0e4ff",
            }}>Coach is thinking…</div>
          </div>
        )}

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#c0392b", marginTop: 8 }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: "12px", borderTop: "1px solid #e0e4ff", background: "#fff" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={loading}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 8,
              border: "1.5px solid #d0d8ff", fontSize: 13, outline: "none",
              background: loading ? "#f8f8f8" : "#fff",
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: "#4a90d9", color: "#fff", border: "none", borderRadius: 8,
              padding: "0 16px", cursor: loading ? "default" : "pointer",
              fontSize: 18, opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >→</button>
        </div>
      </form>
    </div>
  );
}
