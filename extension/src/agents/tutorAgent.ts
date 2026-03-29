/**
 * TutorAgent — runs in the background service worker context.
 * Uses plain fetch (not the Anthropic SDK) to avoid MV3 bundling issues.
 * Called via chrome.runtime.connect() port from CoachPanel.
 */
import { TutorMessagePayload, TutorResponsePayload, TutorTurn } from "../utils/messages";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are Coach, a warm, patient, and encouraging math tutor built into a web browser accessibility tool. Your users have dyscalculia, dyslexia, math anxiety, or other learning differences. They may feel embarrassed or anxious asking for help.

Your rules:
- NEVER shame or judge. Always be encouraging.
- Break problems into the SMALLEST possible steps.
- Ask only ONE question at a time in Socratic mode.
- In open mode, answer the user's question directly but gently, then check understanding.
- Never give the full answer until the user has worked through it with you, unless they explicitly ask.
- Use simple language. Avoid jargon. If you must use a math term, explain it immediately.
- Use visual analogies when helpful (e.g., "imagine you have 5 apples...").
- Keep responses SHORT — 2–4 sentences maximum per turn.
- Always end with either a question or a gentle encouragement.`;

const FALLBACK_SOCRATIC_QUESTIONS = [
  "Let's slow down and break it apart. What do you think this is asking you to find?",
  "What part of this feels most confusing right now? Try to point at just one thing.",
  "Can you put this problem into your own words — as if you were explaining it to a friend?",
  "What information do you already have? Let's list what we know first.",
  "If you had to make a guess at a first step, what would it be? There's no wrong answer here.",
];

let fallbackIndex = 0;
function nextFallbackQuestion(): string {
  const q = FALLBACK_SOCRATIC_QUESTIONS[fallbackIndex % FALLBACK_SOCRATIC_QUESTIONS.length];
  fallbackIndex++;
  return q;
}

export async function runTutorAgent(payload: TutorMessagePayload): Promise<TutorResponsePayload> {
  const apiKey = payload.apiKey?.trim();

  if (!apiKey) {
    const reply = payload.mode === "socratic"
      ? nextFallbackQuestion()
      : "I need a Claude API key to answer questions. Add it in DyslexAI settings (click the extension icon).";
    return {
      reply,
      conversationHistory: [
        ...payload.conversationHistory,
        ...(payload.userMessage ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }] : []),
        { role: "assistant", content: reply, mode: payload.mode },
      ],
    };
  }

  const contextPrefix = `The user is reading this on a webpage:\n\n"${payload.regionText}"\n\n`;
  type Msg = { role: "user" | "assistant"; content: string };
  let messages: Msg[];

  if (payload.conversationHistory.length === 0) {
    const content = payload.mode === "socratic"
      ? contextPrefix + "Please ask me ONE gentle guiding question to help me start thinking about this."
      : contextPrefix + payload.userMessage;
    messages = [{ role: "user", content }];
  } else {
    messages = payload.conversationHistory
      .filter((t) => t.content.trim() !== "")
      .map((t, i) => ({
        role: t.role as "user" | "assistant",
        content: i === 0 ? contextPrefix + t.content : t.content,
      }));
    if (payload.userMessage.trim()) {
      messages.push({ role: "user", content: payload.userMessage });
    }
  }

  if (messages.length === 0) {
    messages = [{ role: "user", content: contextPrefix + "Please ask me a guiding question." }];
  }

  try {
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
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`${response.status}: ${err}`);
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const reply = data.content?.find((c) => c.type === "text")?.text ?? nextFallbackQuestion();

    const updatedHistory: TutorTurn[] = [
      ...payload.conversationHistory,
      ...(payload.userMessage.trim() ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }] : []),
      { role: "assistant", content: reply, mode: payload.mode },
    ];

    return { reply, conversationHistory: updatedHistory };
  } catch (err) {
    const fallback = payload.mode === "socratic"
      ? nextFallbackQuestion()
      : `I had trouble connecting. Here's a starting point: ${nextFallbackQuestion()}`;
    console.error("[DyslexAI] Tutor agent error:", err);
    return {
      reply: fallback,
      conversationHistory: [
        ...payload.conversationHistory,
        ...(payload.userMessage.trim() ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }] : []),
        { role: "assistant", content: fallback, mode: payload.mode },
      ],
    };
  }
}
