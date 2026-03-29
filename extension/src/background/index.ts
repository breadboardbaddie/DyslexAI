import { getSettings } from "../utils/storage";
import { AgentMessage } from "../utils/messages";
import { runScannerAgent } from "../agents/scannerAgent";
import { runTutorAgent } from "../agents/tutorAgent";
import { runAccessibilityAgent } from "../agents/accessibilityAgent";

// Background service worker — routes messages between content script and agents
chrome.runtime.onMessage.addListener(
  (message: AgentMessage, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch((err) => {
      console.error("[DyslexAI background] error:", err);
      sendResponse({ error: String(err) });
    });
    return true; // keep message channel open for async response
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
  const settings = await getSettings();

  switch (message.type) {
    case "SCAN_REQUEST":
      return runScannerAgent(message.payload as Parameters<typeof runScannerAgent>[0], settings);

    case "TUTOR_MESSAGE":
      return runTutorAgent(message.payload as Parameters<typeof runTutorAgent>[0], settings);

    case "ACCESSIBILITY_SUGGEST":
      return runAccessibilityAgent(message.payload as Parameters<typeof runAccessibilityAgent>[0], settings);

    default:
      return null;
  }
}
