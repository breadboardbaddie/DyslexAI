import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSettings, saveSettings, DyslexAISettings, DEFAULT_SETTINGS } from "../utils/storage";
import { createMessage } from "../utils/messages";

function Popup() {
  const [settings, setSettings] = useState<DyslexAISettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function update(partial: Partial<DyslexAISettings>) {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);

    // Notify active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, createMessage("SETTINGS_UPDATED", {}));
      }
    });
  }

  function updateLens(partial: Partial<DyslexAISettings["lensMode"]>) {
    update({ lensMode: { ...settings.lensMode, ...partial } });
  }

  function updateCoach(partial: Partial<DyslexAISettings["coachMode"]>) {
    update({ coachMode: { ...settings.coachMode, ...partial } });
  }

  const l = settings.lensMode;
  const c = settings.coachMode;

  return (
    <div style={{ padding: 16 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <span style={{ fontWeight: 800, fontSize: 17, color: "#2d3a8c" }}>DyslexAI</span>
        {saved && <span style={{ marginLeft: "auto", color: "#50c878", fontSize: 12, fontWeight: 600 }}>Saved ✓</span>}
      </div>

      {/* Lens Mode */}
      <Section title="Lens Mode" emoji="🔍">
        <Toggle label="Enable Lens Mode" checked={l.enabled} onChange={(v) => updateLens({ enabled: v })} />
        {l.enabled && (
          <>
            <Select
              label="Font"
              value={l.font}
              options={[
                { value: "system", label: "System default" },
                { value: "OpenDyslexic", label: "OpenDyslexic" },
                { value: "Arial", label: "Arial" },
                { value: "Verdana", label: "Verdana" },
              ]}
              onChange={(v) => updateLens({ font: v as DyslexAISettings["lensMode"]["font"] })}
            />
            <Slider label="Letter spacing" value={l.letterSpacing} min={0} max={0.3} step={0.01}
              onChange={(v) => updateLens({ letterSpacing: v })} />
            <Slider label="Line height" value={l.lineHeight} min={1.0} max={3.0} step={0.1}
              onChange={(v) => updateLens({ lineHeight: v })} />
            <Toggle label="Highlight numbers" checked={l.highlightNumbers} onChange={(v) => updateLens({ highlightNumbers: v })} />
            {l.highlightNumbers && (
              <ColorPicker label="Highlight color" value={l.numberHighlightColor}
                defaultColor="#ffe066"
                onChange={(v) => updateLens({ numberHighlightColor: v })} />
            )}
            <ColorPicker label="Overlay tint (optional)" value={l.overlayColor ?? ""}
              onChange={(v) => updateLens({ overlayColor: v || null })}
              onClear={() => updateLens({ overlayColor: null })} />
          </>
        )}
      </Section>

      {/* Coach Mode */}
      <Section title="Coach Mode" emoji="🎓">
        <Toggle label="Enable Coach Mode" checked={c.enabled} onChange={(v) => updateCoach({ enabled: v })} />
        {c.enabled && (
          <>
            <Select
              label="Detection level"
              value={c.aggressiveness}
              options={[
                { value: "gentle", label: "Gentle — clear word problems only" },
                { value: "balanced", label: "Balanced — word problems + numbers" },
                { value: "thorough", label: "Thorough — all quantitative text" },
              ]}
              onChange={(v) => updateCoach({ aggressiveness: v as DyslexAISettings["coachMode"]["aggressiveness"] })}
            />
            <ApiKeyInput value={c.apiKey} onChange={(v) => updateCoach({ apiKey: v })} />
            <button
              onClick={() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, createMessage("TRIGGER_COACH", {}));
                  }
                });
                window.close();
              }}
              style={{
                width: "100%", marginTop: 4, padding: "8px 0",
                background: "#4a90d9", color: "#fff", border: "none",
                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Open Coach on this page →
            </button>
          </>
        )}
      </Section>

      {/* Settings link */}
      <div style={{ marginTop: 12, textAlign: "center" }}>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          style={{ background: "none", border: "none", color: "#4a90d9", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
        >
          Full settings & onboarding →
        </button>
      </div>
    </div>
  );
}

// --- Reusable components ---

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16, background: "#fff", borderRadius: 10, padding: "12px", border: "1px solid #e8eaff" }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#2d3a8c", marginBottom: 10 }}>{emoji} {title}</div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, cursor: "pointer" }}>
      <span style={{ fontSize: 13, color: "#444" }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: checked ? "#4a90d9" : "#ccc",
          position: "relative", transition: "background 0.2s", cursor: "pointer",
        }}
      >
        <div style={{
          position: "absolute", top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </label>
  );
}

function Select({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 12 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  const display = value === 0 ? "off" : value.toFixed(2);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color: value === 0 ? "#ccc" : "#666" }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#4a90d9" }} />
    </div>
  );
}

function ColorPicker({ label, value, onChange, onClear, defaultColor }: {
  label: string; value: string; onChange: (v: string) => void;
  onClear?: () => void; defaultColor?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#555" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input type="color" value={value || defaultColor || "#ffffff"} onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 24, border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", padding: 0 }} />
        {onClear && value && (
          <button onClick={onClear}
            style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontSize: 11, color: "#888" }}>
            ✕
          </button>
        )}
        {defaultColor && value !== defaultColor && !onClear && (
          <button onClick={() => onChange(defaultColor)}
            style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontSize: 11, color: "#888" }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function ApiKeyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>Claude API key</div>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-ant-..."
          style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 12 }}
        />
        <button onClick={() => setShow(!show)}
          style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 6, padding: "0 8px", cursor: "pointer", fontSize: 11 }}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>Stored locally. Never sent anywhere except Claude API.</div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
