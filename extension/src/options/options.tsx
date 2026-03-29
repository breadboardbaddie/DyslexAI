import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSettings, saveSettings, DyslexAISettings, DEFAULT_SETTINGS } from "../utils/storage";

function Options() {
  const [settings, setSettings] = useState<DyslexAISettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"lens" | "coach" | "advanced">("lens");
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function save(updated: DyslexAISettings) {
    setSettings(updated);
    await saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function updateLens(partial: Partial<DyslexAISettings["lensMode"]>) {
    save({ ...settings, lensMode: { ...settings.lensMode, ...partial } });
  }
  function updateCoach(partial: Partial<DyslexAISettings["coachMode"]>) {
    save({ ...settings, coachMode: { ...settings.coachMode, ...partial } });
  }

  const l = settings.lensMode;
  const c = settings.coachMode;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🧠</span>
        <h1 style={{ margin: 0, fontSize: 22, color: "#2d3a8c" }}>DyslexAI Settings</h1>
        {saved && <span style={{ marginLeft: "auto", color: "#50c878", fontWeight: 700 }}>Saved ✓</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["lens", "coach", "advanced"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              background: activeTab === t ? "#4a90d9" : "#e8eaff",
              color: activeTab === t ? "#fff" : "#2d3a8c",
              fontWeight: activeTab === t ? 700 : 400, fontSize: 14,
            }}>
            {t === "lens" ? "🔍 Lens Mode" : t === "coach" ? "🎓 Coach Mode" : "⚙️ Advanced"}
          </button>
        ))}
      </div>

      {activeTab === "lens" && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e0e4ff" }}>
          <Row label="Enable Lens Mode">
            <Toggle checked={l.enabled} onChange={(v) => updateLens({ enabled: v })} />
          </Row>
          <Row label="Font">
            <select value={l.font} onChange={(e) => updateLens({ font: e.target.value as DyslexAISettings["lensMode"]["font"] })}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}>
              <option value="system">System default</option>
              <option value="OpenDyslexic">OpenDyslexic</option>
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
            </select>
          </Row>
          <SliderRow label={`Letter spacing: ${l.letterSpacing.toFixed(2)}em`} value={l.letterSpacing} min={0} max={0.3} step={0.01} onChange={(v) => updateLens({ letterSpacing: v })} />
          <SliderRow label={`Word spacing: ${l.wordSpacing.toFixed(2)}em`} value={l.wordSpacing} min={0} max={0.5} step={0.01} onChange={(v) => updateLens({ wordSpacing: v })} />
          <SliderRow label={`Line height: ${l.lineHeight.toFixed(1)}`} value={l.lineHeight} min={1.0} max={3.0} step={0.1} onChange={(v) => updateLens({ lineHeight: v })} />
          <Row label="Highlight numbers">
            <Toggle checked={l.highlightNumbers} onChange={(v) => updateLens({ highlightNumbers: v })} />
          </Row>
          <Row label="Number highlight color">
            <input type="color" value={l.numberHighlightColor} onChange={(e) => updateLens({ numberHighlightColor: e.target.value })}
              style={{ width: 40, height: 30, border: "none", borderRadius: 4, cursor: "pointer" }} />
          </Row>
          <Row label="Color overlay (optional)">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={l.overlayColor ?? "#ffffff"} onChange={(e) => updateLens({ overlayColor: e.target.value })}
                style={{ width: 40, height: 30, border: "none", borderRadius: 4, cursor: "pointer" }} />
              {l.overlayColor && <button onClick={() => updateLens({ overlayColor: null })}
                style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>Clear</button>}
            </div>
          </Row>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => save({ ...settings, lensMode: DEFAULT_SETTINGS.lensMode })}
              style={{ background: "#fff0f0", border: "1px solid #ffb3b3", color: "#c0392b", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              Reset Lens Mode to defaults
            </button>
          </div>
        </div>
      )}

      {activeTab === "coach" && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e0e4ff" }}>
          <Row label="Enable Coach Mode">
            <Toggle checked={c.enabled} onChange={(v) => updateCoach({ enabled: v })} />
          </Row>
          <Row label="Detection aggressiveness">
            <select value={c.aggressiveness} onChange={(e) => updateCoach({ aggressiveness: e.target.value as DyslexAISettings["coachMode"]["aggressiveness"] })}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}>
              <option value="gentle">Gentle</option>
              <option value="balanced">Balanced</option>
              <option value="thorough">Thorough</option>
            </select>
          </Row>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Claude API Key</div>
            <input type="password" value={c.apiKey} onChange={(e) => updateCoach({ apiKey: e.target.value })}
              placeholder="sk-ant-..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 14 }} />
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Stored locally only. Never sent anywhere except directly to the Claude API.</div>
          </div>
        </div>
      )}

      {activeTab === "advanced" && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e0e4ff" }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Blocked domains</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>DyslexAI won't run on these sites.</div>
          {settings.blockedDomains.map((domain) => (
            <div key={domain} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8f8f8", borderRadius: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>{domain}</span>
              <button onClick={() => save({ ...settings, blockedDomains: settings.blockedDomains.filter((d) => d !== domain) })}
                style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. example.com" style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13 }} />
            <button onClick={() => {
              if (newDomain.trim()) {
                save({ ...settings, blockedDomains: [...settings.blockedDomains, newDomain.trim()] });
                setNewDomain("");
              }
            }} style={{ background: "#4a90d9", color: "#fff", border: "none", borderRadius: 6, padding: "0 14px", cursor: "pointer" }}>Add</button>
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
            <button onClick={() => {
              if (confirm("Reset ALL DyslexAI settings to defaults?")) save(DEFAULT_SETTINGS);
            }}
              style={{ background: "#fff0f0", border: "1px solid #ffb3b3", color: "#c0392b", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              Reset all settings to defaults
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("src/options/onboarding.html") })}
              style={{ background: "#f0f6ff", border: "1px solid #c0d4ff", color: "#2d3a8c", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              Re-run onboarding
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontSize: 14, color: "#444" }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 12, background: checked ? "#4a90d9" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
      <div style={{
        position: "absolute", top: 3, left: checked ? 22 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{label}</div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#4a90d9" }} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Options />);
