import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { saveSettings, DEFAULT_SETTINGS, DyslexAISettings } from "../utils/storage";

type Step = "welcome" | "modes" | "aggression" | "preset" | "apikey" | "done";

function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [settings, setSettings] = useState<DyslexAISettings>({
    ...DEFAULT_SETTINGS,
  });

  function updateLens(partial: Partial<DyslexAISettings["lensMode"]>) {
    setSettings((s) => ({ ...s, lensMode: { ...s.lensMode, ...partial } }));
  }
  function updateCoach(partial: Partial<DyslexAISettings["coachMode"]>) {
    setSettings((s) => ({ ...s, coachMode: { ...s.coachMode, ...partial } }));
  }

  async function finish() {
    await saveSettings({ ...settings, onboardingComplete: true });
    setStep("done");
  }

  return (
    <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", padding: "0 16px" }}>
      {step === "welcome" && <WelcomeStep onNext={() => setStep("modes")} />}
      {step === "modes" && (
        <ModesStep
          lensEnabled={settings.lensMode.enabled}
          coachEnabled={settings.coachMode.enabled}
          onLensChange={(v) => updateLens({ enabled: v })}
          onCoachChange={(v) => updateCoach({ enabled: v })}
          onNext={() => setStep(settings.coachMode.enabled ? "aggression" : "preset")}
        />
      )}
      {step === "aggression" && (
        <AggressionStep
          value={settings.coachMode.aggressiveness}
          onChange={(v) => updateCoach({ aggressiveness: v })}
          onNext={() => setStep("preset")}
        />
      )}
      {step === "preset" && (
        <PresetStep
          onSelect={(preset) => {
            if (preset === "reading") {
              updateLens({ font: "OpenDyslexic", letterSpacing: 0.1, lineHeight: 1.8 });
            } else if (preset === "numbers") {
              updateLens({ highlightNumbers: true, numberHighlightColor: "#ffe066" });
            } else {
              updateLens({ font: "OpenDyslexic", letterSpacing: 0.08, lineHeight: 1.7, highlightNumbers: true });
            }
            if (settings.coachMode.enabled) {
              setStep("apikey");
            } else {
              finish();
            }
          }}
        />
      )}
      {step === "apikey" && (
        <ApiKeyStep
          value={settings.coachMode.apiKey}
          onChange={(v) => updateCoach({ apiKey: v })}
          onNext={finish}
        />
      )}
      {step === "done" && <DoneStep />}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "36px 32px", boxShadow: "0 4px 32px rgba(74,144,217,0.10)", textAlign: "center" }}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "#4a90d9", color: "#fff", border: "none", borderRadius: 10,
      padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer",
      marginTop: 24, boxShadow: "0 2px 8px rgba(74,144,217,0.25)",
    }}>{children}</button>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🧠</div>
      <h1 style={{ fontSize: 26, color: "#2d3a8c", margin: "0 0 12px" }}>Welcome to DyslexAI</h1>
      <p style={{ color: "#666", lineHeight: 1.7, marginBottom: 0 }}>
        DyslexAI makes the web easier to read and understand — for people with dyslexia, dyscalculia, and anyone who finds reading or math harder on screens.<br /><br />
        Let's set you up in about 60 seconds. You can change everything later.
      </p>
      <PrimaryButton onClick={onNext}>Let's go →</PrimaryButton>
    </Card>
  );
}

function ModesStep({ lensEnabled, coachEnabled, onLensChange, onCoachChange, onNext }: {
  lensEnabled: boolean; coachEnabled: boolean;
  onLensChange: (v: boolean) => void; onCoachChange: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <h2 style={{ color: "#2d3a8c", marginTop: 0 }}>Which modes do you want?</h2>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>You can enable both, or just one.</p>
      <ModeCard
        emoji="🔍"
        title="Lens Mode"
        desc="Changes how pages look — fonts, colors, number highlights. Works everywhere, instantly."
        checked={lensEnabled}
        onToggle={() => onLensChange(!lensEnabled)}
      />
      <ModeCard
        emoji="🎓"
        title="Coach Mode"
        desc="Detects word problems and math on pages. Click to get step-by-step AI help. Needs a Claude API key."
        checked={coachEnabled}
        onToggle={() => onCoachChange(!coachEnabled)}
      />
      <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
    </Card>
  );
}

function ModeCard({ emoji, title, desc, checked, onToggle }: {
  emoji: string; title: string; desc: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        border: `2px solid ${checked ? "#4a90d9" : "#e0e0e0"}`,
        borderRadius: 12, padding: "14px 16px", marginBottom: 12,
        cursor: "pointer", background: checked ? "#f0f6ff" : "#fafafa",
        textAlign: "left", transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#333", fontSize: 14 }}>{title}</div>
          <div style={{ color: "#777", fontSize: 12, marginTop: 2 }}>{desc}</div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          border: `2px solid ${checked ? "#4a90d9" : "#ccc"}`,
          background: checked ? "#4a90d9" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, flexShrink: 0,
        }}>{checked ? "✓" : ""}</div>
      </div>
    </div>
  );
}

function AggressionStep({ value, onChange, onNext }: {
  value: string; onChange: (v: DyslexAISettings["coachMode"]["aggressiveness"]) => void; onNext: () => void;
}) {
  const options = [
    { value: "gentle", label: "Gentle", desc: "Only clear, obvious math word problems" },
    { value: "balanced", label: "Balanced", desc: "Word problems + paragraphs with numbers (recommended)" },
    { value: "thorough", label: "Thorough", desc: "Any sentence mentioning numbers or quantities" },
  ];
  return (
    <Card>
      <h2 style={{ color: "#2d3a8c", marginTop: 0 }}>How much should Coach Mode detect?</h2>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>You can change this anytime.</p>
      {options.map((o) => (
        <div key={o.value} onClick={() => onChange(o.value as DyslexAISettings["coachMode"]["aggressiveness"])}
          style={{
            border: `2px solid ${value === o.value ? "#4a90d9" : "#e0e0e0"}`,
            borderRadius: 10, padding: "12px 14px", marginBottom: 10, cursor: "pointer",
            background: value === o.value ? "#f0f6ff" : "#fafafa", textAlign: "left",
          }}>
          <div style={{ fontWeight: 700, color: "#333", fontSize: 14 }}>{o.label}</div>
          <div style={{ color: "#777", fontSize: 12 }}>{o.desc}</div>
        </div>
      ))}
      <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
    </Card>
  );
}

function PresetStep({ onSelect }: { onSelect: (preset: "reading" | "numbers" | "both") => void }) {
  return (
    <Card>
      <h2 style={{ color: "#2d3a8c", marginTop: 0 }}>What do you mainly find difficult?</h2>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>We'll apply a good starting configuration.</p>
      {[
        { value: "reading", emoji: "📖", label: "Reading text", desc: "Dyslexia font + wider spacing + line height" },
        { value: "numbers", emoji: "🔢", label: "Numbers and math", desc: "Yellow number highlights + number popups" },
        { value: "both", emoji: "🧩", label: "Both", desc: "Full configuration for reading and numbers" },
      ].map((o) => (
        <div key={o.value} onClick={() => onSelect(o.value as "reading" | "numbers" | "both")}
          style={{
            border: "2px solid #e0e0e0", borderRadius: 10, padding: "12px 14px", marginBottom: 10,
            cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4a90d9")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
        >
          <div style={{ fontWeight: 700, fontSize: 14 }}>{o.emoji} {o.label}</div>
          <div style={{ color: "#777", fontSize: 12 }}>{o.desc}</div>
        </div>
      ))}
    </Card>
  );
}

function ApiKeyStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <Card>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
      <h2 style={{ color: "#2d3a8c", marginTop: 0 }}>Add your Claude API key</h2>
      <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6 }}>
        Coach Mode uses the Claude AI. You'll need your own API key from Anthropic.<br />
        Your key is stored locally and only used to talk to Claude.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-ant-..."
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 14 }}
        />
        <button onClick={() => setShow(!show)}
          style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
        Get a free key at <strong>console.anthropic.com</strong>. You can skip this and add it later in settings.
      </div>
      <PrimaryButton onClick={onNext}>{value ? "Finish setup →" : "Skip for now →"}</PrimaryButton>
    </Card>
  );
}

function DoneStep() {
  return (
    <Card>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
      <h2 style={{ color: "#2d3a8c" }}>You're all set!</h2>
      <p style={{ color: "#666", lineHeight: 1.7 }}>
        DyslexAI is now active. Browse to any page and click the extension icon to adjust settings anytime.
      </p>
      <p style={{ color: "#888", fontSize: 13 }}>
        Click any highlighted number for a dot visualization. Click any blue highlighted text to open Coach.
      </p>
      <PrimaryButton onClick={() => window.close()}>Start browsing →</PrimaryButton>
    </Card>
  );
}

createRoot(document.getElementById("root")!).render(<Onboarding />);
