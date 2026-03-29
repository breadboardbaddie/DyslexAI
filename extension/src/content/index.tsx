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

  // Check if this domain is blocked
  const hostname = window.location.hostname;
  if (settings.blockedDomains.some((d) => hostname.includes(d))) return;

  if (settings.lensMode.enabled) {
    applyLensMode(settings);
  }
  if (settings.lensMode.highlightNumbers && settings.lensMode.enabled) {
    highlightNumbers(openNumberPopup);
  }
  if (settings.coachMode.enabled) {
    scanPageForMath();
  }

  // Re-scan on DOM changes (for SPAs)
  const observer = new MutationObserver(() => {
    if (settings.coachMode.enabled) {
      scanPageForMath();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
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
  if (popupRoot) {
    popupRoot.unmount();
    popupRoot = null;
  }
  popupContainer?.remove();
  popupContainer = null;
}

function openCoachPanel(regionText: string) {
  if (coachContainer) return; // already open

  coachContainer = document.createElement("div");
  coachContainer.id = "dyslexai-coach-root";
  document.body.appendChild(coachContainer);

  coachRoot = createRoot(coachContainer);
  coachRoot.render(
    <CoachPanel
      regionText={regionText}
      onClose={closeCoachPanel}
    />
  );
}

function closeCoachPanel() {
  if (coachRoot) {
    coachRoot.unmount();
    coachRoot = null;
  }
  coachContainer?.remove();
  coachContainer = null;
}

async function scanPageForMath() {
  // Pass 1: client-side local scan — works without API key, instant
  const localRegions = scanPageLocally(settings.coachMode.aggressiveness);
  for (const region of localRegions) {
    if (!region.element.hasAttribute("data-dyslexai-coach")) {
      region.element.classList.add("dyslexai-coach-region");
      region.element.setAttribute("data-dyslexai-coach", region.text);
      region.element.addEventListener("click", () => openCoachPanel(region.text), { once: true });
    }
  }

  // Pass 2: AI scan if API key available — enhances with better detection
  const apiKey = settings.coachMode.apiKey;
  if (!apiKey) return;

  const bodyText = document.body.innerText.slice(0, 6000);
  if (!bodyText.trim()) return;

  const msg = createMessage("SCAN_REQUEST", {
    text: bodyText,
    aggressiveness: settings.coachMode.aggressiveness,
  });

  try {
    const result = await sendToBackground(msg) as { regions: Array<{ text: string; type: string; confidence: number }> };
    if (!result?.regions?.length) return;

    result.regions
      .filter((r) => r.confidence > 0.5)
      .forEach((region) => {
        markCoachRegion(region.text, region.type);
      });
  } catch {
    // Silent fail — AI scan is enhancement only
  }
}

function markCoachRegion(text: string, _type: string) {
  if (!text || text.length < 10) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const nodeText = node.textContent || "";
    const idx = nodeText.indexOf(text.slice(0, 60));
    if (idx === -1) continue;

    const parent = node.parentElement;
    if (!parent || parent.classList.contains("dyslexai-coach-region")) continue;

    parent.classList.add("dyslexai-coach-region");
    parent.setAttribute("data-dyslexai-coach", text);
    parent.addEventListener("click", () => openCoachPanel(text), { once: true });
    break;
  }
}

// Listen for messages from background / popup
chrome.runtime.onMessage.addListener((message: AgentMessage) => {
  if (message.type === "SETTINGS_UPDATED") {
    getSettings().then((s) => {
      settings = s;
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
    });
  }
  if (message.type === "TRIGGER_COACH") {
    const bodyText = document.body.innerText.slice(0, 500);
    openCoachPanel(bodyText);
  }
});

init();
