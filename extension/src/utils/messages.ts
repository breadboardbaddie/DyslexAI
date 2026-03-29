export type AgentMessageType =
  | "SCAN_REQUEST"
  | "SCAN_RESULT"
  | "TUTOR_MESSAGE"
  | "TUTOR_RESPONSE"
  | "ACCESSIBILITY_SUGGEST"
  | "TRIGGER_COACH"
  | "SETTINGS_UPDATED"
  | "LENS_APPLY"
  | "LENS_REMOVE";

export interface AgentMessage<T = unknown> {
  version: "1.0";
  type: AgentMessageType;
  payload: T;
  timestamp: number;
}

export interface ScanRequestPayload {
  text: string;
  aggressiveness: "gentle" | "balanced" | "thorough";
}

export interface ScanRegion {
  text: string;
  type: "word_problem" | "equation" | "statistic" | "number_mention";
  confidence: number;
  domSelector: string;
}

export interface ScanResultPayload {
  regions: ScanRegion[];
}

export interface TutorMessagePayload {
  regionText: string;
  conversationHistory: TutorTurn[];
  userMessage: string;
  mode: "open" | "socratic";
  apiKey: string; // passed from content script — avoids background re-read issue
}

export interface TutorTurn {
  role: "user" | "assistant";
  content: string;
  mode: "open" | "socratic";
}

export interface TutorResponsePayload {
  reply: string;
  conversationHistory: TutorTurn[];
}

export interface AccessibilitySuggestPayload {
  suggest: {
    font?: string;
    overlay?: string;
    spacing?: "normal" | "wide";
  };
  reason: string;
}

export function createMessage<T>(
  type: AgentMessageType,
  payload: T
): AgentMessage<T> {
  return { version: "1.0", type, payload, timestamp: Date.now() };
}

export function sendToBackground<T>(message: AgentMessage<T>): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}
