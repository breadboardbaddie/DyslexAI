import Anthropic from "@anthropic-ai/sdk";
import { TutorMessagePayload, TutorResponsePayload, TutorTurn } from "../utils/messages";

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

// Fallback questions used when API is unavailable or key is missing.
// Deliberately open-ended and scaffolding-focused.
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

export async function runTutorAgent(
  payload: TutorMessagePayload,
): Promise<TutorResponsePayload> {
  // API key comes directly from the payload (passed by content script from storage)
  const apiKey = payload.apiKey?.trim();

  // No key — use fallback for socratic, friendly message for open
  if (!apiKey) {
    const reply = payload.mode === "socratic"
      ? nextFallbackQuestion()
      : "I need a Claude API key to answer questions. Add it in DyslexAI settings (click the extension icon). Once added, I can help explain anything!";

    return {
      reply,
      conversationHistory: [
        ...payload.conversationHistory,
        ...(payload.userMessage ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }] : []),
        { role: "assistant", content: reply, mode: payload.mode },
      ],
    };
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  // Build the message array for Claude
  const contextPrefix = `The user is reading this on a webpage:\n\n"${payload.regionText}"\n\n`;

  let messages: Anthropic.MessageParam[];

  if (payload.conversationHistory.length === 0) {
    // First turn
    const userContent = payload.mode === "socratic"
      ? contextPrefix + "Please ask me ONE gentle guiding question to help me start thinking about this."
      : contextPrefix + payload.userMessage;

    messages = [{ role: "user", content: userContent }];
  } else {
    // Build full history — inject context only into the first message
    messages = payload.conversationHistory
      .filter((t) => t.content.trim() !== "") // skip empty turns
      .map((t, i) => ({
        role: t.role as "user" | "assistant",
        content: i === 0 ? contextPrefix + t.content : t.content,
      }));

    if (payload.userMessage.trim()) {
      messages.push({ role: "user", content: payload.userMessage });
    }
  }

  // Guard: Claude requires at least one message and alternating roles
  if (messages.length === 0) {
    messages = [{ role: "user", content: contextPrefix + "Please ask me a guiding question." }];
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : nextFallbackQuestion();

    const updatedHistory: TutorTurn[] = [
      ...payload.conversationHistory,
      ...(payload.userMessage.trim()
        ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }]
        : []),
      { role: "assistant", content: reply, mode: payload.mode },
    ];

    return { reply, conversationHistory: updatedHistory };

  } catch (err) {
    // API failed — use fallback question rather than showing an error
    const fallback = payload.mode === "socratic"
      ? nextFallbackQuestion()
      : `I had trouble connecting right now. Here's a starting point: ${nextFallbackQuestion()}`;

    console.error("[DyslexAI] Tutor agent error:", err);

    return {
      reply: fallback,
      conversationHistory: [
        ...payload.conversationHistory,
        ...(payload.userMessage.trim()
          ? [{ role: "user" as const, content: payload.userMessage, mode: payload.mode }]
          : []),
        { role: "assistant", content: fallback, mode: payload.mode },
      ],
    };
  }
}
