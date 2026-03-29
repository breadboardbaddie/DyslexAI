import React, { useState, useEffect, useRef } from "react";

interface Props {
  value: string;
  numericValue: number | null;
  anchorEl: HTMLElement;
  onClose: () => void;
}

type PopupTab = "dots" | "audio" | "style";

export function NumberPopup({ value, numericValue, anchorEl, onClose }: Props) {
  const [tab, setTab] = useState<PopupTab>("dots");
  const [chunkSize, setChunkSize] = useState<5 | 10>(10);
  const [speaking, setSpeaking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Position popup near the anchor element
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    const rect = anchorEl.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    setPos({
      top: rect.bottom + scrollY + 8,
      left: Math.min(rect.left + scrollX, window.innerWidth - 300),
    });
  }, [anchorEl]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) && e.target !== anchorEl) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
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

  return (
    <div
      ref={popupRef}
      id="dyslexai-popup"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>{value}</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#999", lineHeight: 1 }}
          aria-label="Close"
        >×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {(["dots", "audio", "style"] as PopupTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "4px 0", borderRadius: 6, border: "none", cursor: "pointer",
              background: tab === t ? "#4a90d9" : "#f0f0f0",
              color: tab === t ? "#fff" : "#555",
              fontSize: 12, fontWeight: tab === t ? 700 : 400,
            }}
          >
            {t === "dots" ? "Dots" : t === "audio" ? "Audio" : "Style"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "dots" && <DotsView numericValue={numericValue} chunkSize={chunkSize} setChunkSize={setChunkSize} />}
      {tab === "audio" && <AudioView value={value} speaking={speaking} onSpeak={speakNumber} />}
      {tab === "style" && <StyleView />}
    </div>
  );
}

// --- Dots View ---
function DotsView({
  numericValue,
  chunkSize,
  setChunkSize,
}: {
  numericValue: number | null;
  chunkSize: 5 | 10;
  setChunkSize: (n: 5 | 10) => void;
}) {
  const n = numericValue !== null ? Math.round(Math.abs(numericValue)) : null;

  if (n === null || n > 999) {
    return (
      <div style={{ color: "#666", fontSize: 13, textAlign: "center", padding: "8px 0" }}>
        Number too large for dot view.<br />
        <span style={{ fontSize: 12, color: "#999" }}>Try Audio tab to hear it spoken.</span>
      </div>
    );
  }

  if (n <= 20) {
    return <IndividualDots count={n} />;
  }

  return <GroupedDots count={n} chunkSize={chunkSize} setChunkSize={setChunkSize} />;
}

function IndividualDots({ count }: { count: number }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", padding: "4px 0 8px" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 14, height: 14, borderRadius: "50%",
              background: "#4a90d9", flexShrink: 0,
            }}
          />
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#888" }}>{count} dot{count !== 1 ? "s" : ""}</div>
    </div>
  );
}

function GroupedDots({
  count,
  chunkSize,
  setChunkSize,
}: {
  count: number;
  chunkSize: 5 | 10;
  setChunkSize: (n: 5 | 10) => void;
}) {
  const groups = Math.floor(count / chunkSize);
  const remainder = count % chunkSize;

  const colors = ["#4a90d9", "#50c878", "#ff8c42", "#9b59b6", "#e74c3c"];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 8 }}>
        {Array.from({ length: groups }).map((_, gi) => (
          <div key={gi} style={{ display: "flex", flexWrap: "wrap", gap: 2, width: chunkSize === 5 ? 40 : 56, padding: 3, background: "#f5f5f5", borderRadius: 6 }}>
            {Array.from({ length: chunkSize }).map((_, di) => (
              <div key={di} style={{ width: 10, height: 10, borderRadius: "50%", background: colors[gi % colors.length] }} />
            ))}
          </div>
        ))}
        {remainder > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 3, background: "#f5f5f5", borderRadius: 6 }}>
            {Array.from({ length: remainder }).map((_, di) => (
              <div key={di} style={{ width: 10, height: 10, borderRadius: "50%", background: "#aaa" }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#888", marginBottom: 6 }}>
        {groups} group{groups !== 1 ? "s" : ""} of {chunkSize}{remainder > 0 ? ` + ${remainder}` : ""} = {count}
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        <button
          onClick={() => setChunkSize(5)}
          style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: "1px solid #ddd", background: chunkSize === 5 ? "#4a90d9" : "#f0f0f0", color: chunkSize === 5 ? "#fff" : "#555", cursor: "pointer" }}
        >Groups of 5</button>
        <button
          onClick={() => setChunkSize(10)}
          style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: "1px solid #ddd", background: chunkSize === 10 ? "#4a90d9" : "#f0f0f0", color: chunkSize === 10 ? "#fff" : "#555", cursor: "pointer" }}
        >Groups of 10</button>
      </div>
    </div>
  );
}

// --- Audio View ---
function AudioView({ value, speaking, onSpeak }: { value: string; speaking: boolean; onSpeak: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <button
        onClick={onSpeak}
        disabled={speaking}
        style={{
          background: speaking ? "#ccc" : "#4a90d9", color: "#fff",
          border: "none", borderRadius: 8, padding: "10px 24px",
          fontSize: 15, cursor: speaking ? "default" : "pointer",
          fontWeight: 600, marginBottom: 8,
        }}
      >
        {speaking ? "Speaking..." : "▶ Hear it"}
      </button>
      <div style={{ fontSize: 12, color: "#888" }}>Plays "{value}" aloud</div>
    </div>
  );
}

// --- Style View ---
function StyleView() {
  return (
    <div style={{ fontSize: 12, color: "#666", textAlign: "center", padding: "4px 0" }}>
      <div style={{ marginBottom: 8, color: "#444", fontWeight: 600 }}>Number display settings</div>
      <div>Open the DyslexAI settings panel to change highlight colors and number fonts globally.</div>
    </div>
  );
}
