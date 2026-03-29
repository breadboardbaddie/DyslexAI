import { getSettings } from "../utils/storage";
import { AgentMessage } from "../utils/messages";
import { runScannerAgent } from "../agents/scannerAgent";
import { runTutorAgent } from "../agents/tutorAgent";
import { runAccessibilityAgent } from "../agents/accessibilityAgent";

// Long-lived port connection for tutor calls.
// Ports keep the service worker alive for the duration of the API call,
// solving the MV3 "worker killed mid-fetch" problem.
// Background can also call external APIs (no CORS) — content scripts cannot.
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "dyslexai-tutor") return;

  port.onMessage.addListener(async (payload) => {
    try {
      const result = await runTutorAgent(payload);
      port.postMessage({ ok: true, result });
    } catch (err) {
      console.error("[DyslexAI background] tutor error:", err);
      port.postMessage({ ok: false, error: String(err) });
    }
  });
});

// Standard message handler for scan + accessibility agents
chrome.runtime.onMessage.addListener(
  (message: AgentMessage, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch((err) => {
      console.error("[DyslexAI background] error:", err);
      sendResponse({ error: String(err) });
    });
    return true;
  }
);

// Open onboarding on first install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    const settings = await getSettings();
    if (!settings.onboardingComplete) {
      chrome.tabs.create({ url: chrome.runtime.getURL("src/options/onboarding.html") });
    }
  }
});

async function handleMessage(message: AgentMessage): Promise<unknown> {
  switch (message.type) {
    case "SCAN_REQUEST": {
      const settings = await getSettings();
      return runScannerAgent(message.payload as Parameters<typeof runScannerAgent>[0], settings);
    }
    case "ACCESSIBILITY_SUGGEST": {
      const settings = await getSettings();
      return runAccessibilityAgent(message.payload as Parameters<typeof runAccessibilityAgent>[0], settings);
    }
    default:
      return null;
  }
}
