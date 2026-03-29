import Anthropic from "@anthropic-ai/sdk";
import { DyslexAISettings, getApiKey } from "../utils/storage";
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

export async function runTutorAgent(
  payload: TutorMessagePayload,
  settings: DyslexAISettings
): Promise<TutorResponsePayload> {
  const apiKey = getApiKey(settings);
  if (!apiKey) {
    return {
      reply: "Please add your Claude API key in DyslexAI settings to use Coach Mode.",
      conversationHistory: payload.conversationHistory,
    };
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  // Build message history for Claude
  const contextMessage = `The user is looking at this content on a webpage:\n\n"${payload.regionText}"\n\n`;

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: contextMessage + (
        payload.mode === "socratic" && payload.conversationHistory.length === 0
          ? "Please ask me a guiding question to help me start thinking about this."
          : payload.userMessage
      ),
    },
  ];

  // Inject prior conversation turns
  if (payload.conversationHistory.length > 0) {
    const history: Anthropic.MessageParam[] = payload.conversationHistory.map((t: TutorTurn) => ({
      role: t.role as "user" | "assistant",
      content: t.content,
    }));
    messages.unshift(...history);
    // Replace first message to include context only once
    messages[0] = {
      role: "user",
      content: contextMessage + payload.conversationHistory[0].content,
    };
    messages.push({ role: "user", content: payload.userMessage });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply =
    response.content[0].type === "text"
      ? response.content[0].text
      : "I had trouble responding. Please try again.";

  const updatedHistory: TutorTurn[] = [
    ...payload.conversationHistory,
    { role: "user", content: payload.userMessage, mode: payload.mode },
    { role: "assistant", content: reply, mode: payload.mode },
  ];

  return { reply, conversationHistory: updatedHistory };
}
