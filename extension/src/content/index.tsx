import React from "react";
import { createRoot } from "react-dom/client";
import { getSettings, DyslexAISettings } from "../utils/storage";
import { applyLensMode, removeLensMode } from "./lensMode";
import { highlightNumbers, clearNumberHighlights } from "./numberHighlighter";
import { NumberPopup } from "../components/NumberPopup";
import { CoachPanel } from "../components/CoachPanel";
import { createMessage, sendToBackground } from "../utils/messages";
import { AgentMessage } from "../utils/messages";
import { scanPageLocally } from "../utils/mathScanner";

let settings: DyslexAISettings;
let popupRoot: ReturnType<typeof createRoot> | null = null;
let popupContainer: HTMLDivElement | null = null;
let coachRoot: ReturnType<typeof createRoot> | null = null;
let coachContainer: HTMLDivElement | null = null;

async function init() {
  settings = await getSettings();

  const hostname = window.location.hostname;
  if (settings.blockedDomains.some((d) => hostname.includes(d))) return;

  if (settings.lensMode.enabled) {
    applyLensMode(settings);
    if (settings.lensMode.highlightNumbers) {
      highlightNumbers(openNumberPopup);
    }
  }

  if (settings.coachMode.enabled) {
    scanPageForMath();
    if (settings.coachMode.apiKey) {
      runAccessibilitySuggestion();
    }
  }

  // Re-scan on DOM changes (for SPAs) — debounced via requestIdleCallback
  // to avoid jank on large DOMs (e.g. Wikipedia) during TreeWalker traversal
  let idleCallbackId: number | null = null;
  const observer = new MutationObserver(() => {
    if (!settings.coachMode.enabled) return;
    if (idleCallbackId !== null) return; // already queued
    idleCallbackId = requestIdleCallback(() => {
      idleCallbackId = null;
      scanPageForMath();
    }, { timeout: 1000 });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Keyboard shortcut: Alt+C opens Coach on any page
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "c" && settings.coachMode.enabled) {
      e.preventDefault();
      const bodyText = document.body.innerText.slice(0, 500);
      openCoachPanel(bodyText);
    }
  });
}

function openNumberPopup(value: string, numericValue: number | null, anchorEl: HTMLElement) {
  closeNumberPopup();

  popupContainer = document.createElement("div");
  popupContainer.id = "dyslexai-popup-root";
  document.body.appendChild(popupContainer);

  popupRoot = createRoot(popupContainer);
  popupRoot.render(
    <NumberPopup
      value={value}
      numericValue={numericValue}
      anchorEl={anchorEl}
      onClose={closeNumberPopup}
    />
  );
}

function closeNumberPopup() {
  if (popupRoot) { popupRoot.unmount(); popupRoot = null; }
  popupContainer?.remove();
  popupContainer = null;
}

function openCoachPanel(regionText: string) {
  // If already open, just update the context
  if (coachContainer) {
    closeCoachPanel();
  }

  coachContainer = document.createElement("div");
  coachContainer.id = "dyslexai-coach-root";
  document.body.appendChild(coachContainer);

  coachRoot = createRoot(coachContainer);
  coachRoot.render(
    <CoachPanel regionText={regionText} onClose={closeCoachPanel} />
  );
}

function closeCoachPanel() {
  if (coachRoot) { coachRoot.unmount(); coachRoot = null; }
  coachContainer?.remove();
  coachContainer = null;
}

function clearCoachRegions() {
  document.querySelectorAll(".dyslexai-coach-region").forEach((el) => {
    el.classList.remove("dyslexai-coach-region");
    el.removeAttribute("data-dyslexai-coach");
  });
  closeCoachPanel();
}

async function scanPageForMath() {
  // Pass 1: instant client-side scan — no API key needed
  const localRegions = scanPageLocally(settings.coachMode.aggressiveness);
  for (const region of localRegions) {
    if (!region.element.hasAttribute("data-dyslexai-coach")) {
      attachCoachRegion(region.element as HTMLElement, region.text);
    }
  }

  // Local scan only — avoids concurrent API calls while tutor is active
}

function attachCoachRegion(el: HTMLElement, text: string) {
  el.classList.add("dyslexai-coach-region");
  el.setAttribute("data-dyslexai-coach", text);

  // Open panel on click — natural since ::after pill signals it's interactive
  el.addEventListener("click", (e) => {
    // Don't intercept clicks on links or inputs inside the region
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.tagName === "INPUT" || target.tagName === "BUTTON") return;
    e.stopPropagation();
    openCoachPanel(text);
  });
}

function markCoachRegionByText(text: string) {
  if (!text || text.length < 10) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const nodeText = node.textContent || "";
    if (!nodeText.includes(text.slice(0, 50))) continue;
    const parent = node.parentElement;
    if (!parent || parent.hasAttribute("data-dyslexai-coach")) continue;
    attachCoachRegion(parent, text);
    break;
  }
}

// Listen for settings changes from popup
chrome.runtime.onMessage.addListener((message: AgentMessage) => {
  if (message.type === "SETTINGS_UPDATED") {
    getSettings().then((s) => {
      const prevCoachEnabled = settings.coachMode.enabled;
      settings = s;

      // Lens Mode
      if (s.lensMode.enabled) {
        applyLensMode(s);
        if (s.lensMode.highlightNumbers) {
          highlightNumbers(openNumberPopup);
        } else {
          clearNumberHighlights();
        }
      } else {
        removeLensMode();
        clearNumberHighlights();
      }

      // Coach Mode — clear regions immediately when toggled off
      if (!s.coachMode.enabled && prevCoachEnabled) {
        clearCoachRegions();
      } else if (s.coachMode.enabled && !prevCoachEnabled) {
        scanPageForMath();
      }
    });
  }

  if (message.type === "TRIGGER_COACH") {
    const bodyText = document.body.innerText.slice(0, 500);
    openCoachPanel(bodyText);
  }
});

async function runAccessibilitySuggestion() {
  const sampleText = document.body.innerText.slice(0, 500);
  if (!sampleText.trim()) return;

  const bodyWordCount = sampleText.split(/\s+/).length;
  const contentType = bodyWordCount > 200 ? "dense-text" : "light-content";

  try {
    const result = await sendToBackground(createMessage("ACCESSIBILITY_SUGGEST", {
      contentType,
      sampleText,
    })) as { suggest: { font?: string; overlay?: string }; reason?: string };

    if (!result?.suggest?.font && !result?.suggest?.overlay) return;

    showAccessibilityToast(result);
  } catch {
    // silent — suggestion is enhancement only
  }
}

function showAccessibilityToast(result: { suggest: { font?: string; overlay?: string }; reason?: string }) {
  const existing = document.getElementById("dyslexai-a11y-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "dyslexai-a11y-toast";
  Object.assign(toast.style, {
    position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
    zIndex: "2147483643", background: "#fff", border: "1px solid #d0d8ff",
    borderRadius: "12px", padding: "12px 16px", boxShadow: "0 4px 20px rgba(74,144,217,0.15)",
    fontFamily: "system-ui, sans-serif", fontSize: "13px", color: "#333",
    display: "flex", alignItems: "center", gap: "12px", maxWidth: "420px",
    animation: "slideUp 0.3s ease",
  });

  const suggestions: string[] = [];
  if (result.suggest.font) suggestions.push(`${result.suggest.font} font`);
  if (result.suggest.overlay) suggestions.push("color overlay");

  toast.innerHTML = `
    <span style="font-size:18px">🧠</span>
    <span><strong style="color:#2d3a8c">DyslexAI suggests:</strong> Apply ${suggestions.join(" + ")} for this page?</span>
    <button id="dyslexai-toast-apply" style="background:#4a90d9;color:#fff;border:none;borderRadius:8px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap;font-family:system-ui,sans-serif">Apply</button>
    <button id="dyslexai-toast-dismiss" style="background:none;border:none;cursor:pointer;color:#aaa;font-size:18px;line-height:1;padding:0 4px">×</button>
  `;

  document.body.appendChild(toast);

  document.getElementById("dyslexai-toast-apply")?.addEventListener("click", async () => {
    const updated = { ...settings };
    if (result.suggest.font) updated.lensMode = { ...updated.lensMode, font: result.suggest.font as "OpenDyslexic" | "system" | "Arial" | "Verdana", enabled: true };
    if (result.suggest.overlay) updated.lensMode = { ...updated.lensMode, overlayColor: result.suggest.overlay, enabled: true };
    const { saveSettings } = await import("../utils/storage");
    await saveSettings(updated);
    settings = updated;
    applyLensMode(updated);
    toast.remove();
  });

  document.getElementById("dyslexai-toast-dismiss")?.addEventListener("click", () => toast.remove());

  // Auto-dismiss after 10s
  setTimeout(() => toast.remove(), 10000);
}

init();
