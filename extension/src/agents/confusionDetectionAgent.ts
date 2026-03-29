/**
 * Confusion Detection Agent — STRETCH GOAL
 * Assigned to teammate (Kyle).
 *
 * Uses face-api.js to detect user frustration/confusion via webcam.
 * When confidence exceeds threshold, dispatches TRIGGER_COACH to content script.
 *
 * To implement:
 * 1. npm install face-api.js
 * 2. Load face-api models from /assets/models/
 * 3. Request webcam permission via navigator.mediaDevices.getUserMedia
 * 4. Run expression detection every POLL_INTERVAL_MS
 * 5. If frustrated/disgusted/sad confidence > FRUSTRATION_THRESHOLD, call triggerCoach()
 *
 * DO NOT start this until the core extension features are complete.
 */

const POLL_INTERVAL_MS = 5000;
const FRUSTRATION_THRESHOLD = 0.6;

let isRunning = false;

export function startConfusionDetection(): void {
  if (isRunning) return;
  isRunning = true;
  console.log("[DyslexAI] Confusion Detection Agent: stub ready. Implement with face-api.js.");
  // TODO (Kyle): implement webcam polling here
  void POLL_INTERVAL_MS;
  void FRUSTRATION_THRESHOLD;
}

export function stopConfusionDetection(): void {
  isRunning = false;
}

function triggerCoach(): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        version: "1.0",
        type: "TRIGGER_COACH",
        payload: { reason: "confusion_detected" },
        timestamp: Date.now(),
      });
    }
  });
}

void triggerCoach; // referenced to avoid unused warning
