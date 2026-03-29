import { getSettings } from "../utils/storage";
import { AgentMessage, TutorMessagePayload } from "../utils/messages";
import { runScannerAgent } from "../agents/scannerAgent";
import { runAccessibilityAgent } from "../agents/accessibilityAgent";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const TUTOR_SYSTEM_PROMPT = `You are Coach, a warm, patient, and encouraging math tutor built into a web browser accessibility tool. Your users have dyscalculia, dyslexia, math anxiety, or other learning differences. They may feel embarrassed or anxious asking for help.

Your rules:
- NEVER shame or judge. Always be encouraging.
- Break problems into the SMALLEST possible steps.
- Ask only ONE question at a time in Socratic mode.
- In open mode, answer the user's question directly but gently, then check understanding.
- Never give the full answer until the user has worked through it with you, unless they explicitly ask.
- Use simple language. Avoid jargon. If you must use a math term, explain it immediately.
- Keep responses SHORT — 2–4 sentences maximum per turn.
- Always end with either a question or a gentle encouragement.`;

// Long-lived port for tutor calls — keeps service worker alive, no CORS issues
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "dyslexai-tutor") return;

  port.onMessage.addListener(async (payload: TutorMessagePayload & { keepAlive?: boolean }) => {
    if (payload.keepAlive) return; // ignore pings, just keeping worker alive
    try {
      await streamAnthropicDirect(payload, port);
    } catch (err) {
      console.error("[DyslexAI background] tutor error:", err);
      port.postMessage({ ok: false, error: String(err) });
    }
  });
});

async function streamAnthropicDirect(payload: TutorMessagePayload, port: chrome.runtime.Port): Promise<void> {
  const apiKey = payload.apiKey?.trim();
  if (!apiKey) throw new Error("No API key provided");

  const contextPrefix = `The user is reading this on a webpage:\n\n"${payload.regionText}"\n\n`;

  type Msg = { role: "user" | "assistant"; content: string };
  const messages: Msg[] = [];

  if (payload.conversationHistory.length === 0) {
    const content = payload.mode === "socratic"
      ? contextPrefix + "Please ask me ONE gentle guiding question to help me start thinking about this."
      : contextPrefix + payload.userMessage;
    messages.push({ role: "user", content });
  } else {
    payload.conversationHistory
      .filter((t) => t.content.trim())
      .forEach((t, i) => {
        messages.push({
          role: t.role as "user" | "assistant",
          content: i === 0 ? contextPrefix + t.content : t.content,
        });
      });
    if (payload.userMessage.trim()) {
      messages.push({ role: "user", content: payload.userMessage });
    }
  }

  // Deduplicate consecutive same-role messages
  const deduped: Msg[] = [];
  for (const m of messages) {
    if (deduped.length && deduped[deduped.length - 1].role === m.role) {
      deduped[deduped.length - 1].content += "\n" + m.content;
    } else {
      deduped.push(m);
    }
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      stream: true,
      system: TUTOR_SYSTEM_PROMPT,
      messages: deduped,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status}: ${body}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullReply = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const event = JSON.parse(data) as { type: string; delta?: { type: string; text: string } };
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
          const chunk = event.delta.text;
          fullReply += chunk;
          port.postMessage({ ok: true, type: "chunk", chunk });
        }
      } catch { /* skip malformed SSE lines */ }
    }
  }

  port.postMessage({
    ok: true,
    type: "done",
    result: {
      reply: fullReply,
      conversationHistory: [
        ...payload.conversationHistory,
        ...(payload.userMessage.trim()
          ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }]
          : []),
        { role: "assistant" as const, content: fullReply, mode: payload.mode },
      ],
    },
  });
}

// Standard message handler for scan + accessibility (these use the SDK, which is fine)
chrome.runtime.onMessage.addListener(
  (message: AgentMessage, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch((err) => {
      console.error("[DyslexAI background] error:", err);
      sendResponse({ error: String(err) });
    });
    return true;
  }
);

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
