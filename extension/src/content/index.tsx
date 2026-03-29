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

  // Pass 2: AI-enhanced scan if API key available
  const apiKey = settings.coachMode.apiKey;
  if (!apiKey) return;

  const bodyText = document.body.innerText.slice(0, 6000);
  if (!bodyText.trim()) return;

  const msg = createMessage("SCAN_REQUEST", {
    text: bodyText,
    aggressiveness: settings.coachMode.aggressiveness,
  });

  try {
    const result = await sendToBackground(msg) as {
      regions: Array<{ text: string; type: string; confidence: number }>;
    };
    if (!result?.regions?.length) return;
    result.regions
      .filter((r) => r.confidence > 0.5)
      .forEach((region) => markCoachRegionByText(region.text));
  } catch {
    // silent — AI scan is enhancement only
  }
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

init();
