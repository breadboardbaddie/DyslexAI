import React, { useState, useEffect, useRef } from "react";

interface Props {
  value: string;
  numericValue: number | null;
  anchorEl: HTMLElement;
  onClose: () => void;
}

type PopupTab = "dots" | "audio" | "style";

// All styles inlined — isolated from page CSS via Shadow DOM mount
const POPUP_STYLE = `
  #dyslexai-popup-inner {
    position: fixed;
    z-index: 2147483647;
    background: #ffffff;
    border: 1.5px solid #dde3ff;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(74,144,217,0.18);
    padding: 16px;
    min-width: 220px;
    max-width: 290px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    color: #333;
    line-height: 1.4;
  }
`;

export function NumberPopup({ value, numericValue, anchorEl, onClose }: Props) {
  const [tab, setTab] = useState<PopupTab>("dots");
  const [speaking, setSpeaking] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  // Position popup near anchor
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    const rect = anchorEl.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    // Keep on screen
    if (left + 290 > window.innerWidth) left = window.innerWidth - 300;
    if (top + 300 > window.innerHeight) top = rect.top - 310;
    setPos({ top, left });
  }, [anchorEl]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        innerRef.current &&
        !innerRef.current.contains(e.target as Node) &&
        e.target !== anchorEl
      ) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorEl]);

  const speakNumber = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const s = (style: React.CSSProperties): React.CSSProperties => style;

  return (
    <div
      ref={hostRef}
      id="dyslexai-popup-inner"
      style={s({
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 2147483647,
        background: "#ffffff",
        border: "1.5px solid #dde3ff",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(74,144,217,0.18)",
        padding: 16,
        minWidth: 220,
        maxWidth: 290,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 14,
        color: "#333",
        lineHeight: "1.4",
      })}
    >
      <style>{POPUP_STYLE}</style>
      <div ref={innerRef}>
        {/* Header */}
        <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 })}>
          <span style={s({ fontWeight: 700, fontSize: 17, color: "#2d3a8c" })}>{value}</span>
          <button
            onClick={onClose}
            style={s({ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#aaa", lineHeight: "1", padding: "0 2px" })}
            aria-label="Close"
          >×</button>
        </div>

        {/* Tabs */}
        <div style={s({ display: "flex", gap: 4, marginBottom: 14 })}>
          {(["dots", "audio", "style"] as PopupTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={s({
                flex: 1, padding: "5px 0", borderRadius: 7, border: "none",
                cursor: "pointer",
                background: tab === t ? "#4a90d9" : "#eef1ff",
                color: tab === t ? "#fff" : "#555",
                fontSize: 12,
                fontWeight: tab === t ? 700 : 500,
                fontFamily: "system-ui, sans-serif",
              })}
            >
              {t === "dots" ? "● Dots" : t === "audio" ? "♪ Audio" : "⚙ Style"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "dots" && <DotsView numericValue={numericValue} />}
        {tab === "audio" && <AudioView value={value} speaking={speaking} onSpeak={speakNumber} />}
        {tab === "style" && <StyleView />}
      </div>
    </div>
  );
}

// --- Dot view: always groups of 5 ---
function DotsView({ numericValue }: { numericValue: number | null }) {
  const n = numericValue !== null ? Math.round(Math.abs(numericValue)) : null;

  if (n === null || n > 999) {
    return (
      <div style={{ color: "#666", fontSize: 13, textAlign: "center", padding: "8px 0" }}>
        Too large for dots.<br />
        <span style={{ fontSize: 12, color: "#4a90d9" }}>Try the Audio tab ♪</span>
      </div>
    );
  }

  return <FiveGroupDots count={n} />;
}

function FiveGroupDots({ count }: { count: number }) {
  if (count === 0) {
    return <div style={{ textAlign: "center", color: "#aaa", fontSize: 13 }}>Zero — no dots</div>;
  }

  // Split into groups of 5
  const numFullGroups = Math.floor(count / 5);
  const remainder = count % 5;
  const groups: number[] = [];
  for (let i = 0; i < numFullGroups; i++) groups.push(5);
  if (remainder > 0) groups.push(remainder);

  const colors = ["#4a90d9", "#50c878", "#ff8c42", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c"];

  return (
    <div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        justifyContent: "center",
        marginBottom: 10,
      }}>
        {groups.map((size, gi) => (
          <div
            key={gi}
            style={{
              background: "#f5f7ff",
              border: "1.5px solid #dde3ff",
              borderRadius: 8,
              padding: "6px 7px",
              display: "grid",
              gridTemplateColumns: "repeat(5, 12px)",
              gap: 3,
            }}
          >
            {Array.from({ length: 5 }).map((_, di) => (
              <div
                key={di}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: di < size ? colors[gi % colors.length] : "#e8ecf5",
                  transition: "background 0.1s",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#888" }}>
        {numFullGroups > 0 && (
          <span>{numFullGroups} × 5{remainder > 0 ? ` + ${remainder}` : ""} = </span>
        )}
        <strong style={{ color: "#2d3a8c" }}>{count}</strong>
      </div>
    </div>
  );
}

// --- Audio View ---
function AudioView({ value, speaking, onSpeak }: { value: string; speaking: boolean; onSpeak: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <button
        onClick={onSpeak}
        disabled={speaking}
        style={{
          background: speaking ? "#b0c4de" : "#4a90d9",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 28px",
          fontSize: 15,
          cursor: speaking ? "default" : "pointer",
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          boxShadow: speaking ? "none" : "0 2px 8px rgba(74,144,217,0.3)",
        }}
      >
        {speaking ? "🔊 Speaking..." : "▶ Hear it"}
      </button>
      <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
        Will say: "{value}"
      </div>
    </div>
  );
}

// --- Style View ---
function StyleView() {
  return (
    <div style={{ fontSize: 12, color: "#666", textAlign: "center", padding: "8px 0" }}>
      <div style={{ marginBottom: 8, fontWeight: 600, color: "#2d3a8c", fontSize: 13 }}>Number styling</div>
      <div style={{ color: "#777", lineHeight: 1.6 }}>
        Change highlight color and font in the<br />
        <strong>DyslexAI settings panel</strong>.
      </div>
    </div>
  );
}
