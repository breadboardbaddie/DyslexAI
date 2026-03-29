import Anthropic from "@anthropic-ai/sdk";
import { DyslexAISettings, getApiKey } from "../utils/storage";
import { AccessibilitySuggestPayload } from "../utils/messages";

const SYSTEM_PROMPT = `You are an accessibility configuration agent for a dyslexia/dyscalculia browser tool.
Based on the page content type provided, suggest optimal Lens Mode settings.

Return ONLY valid JSON:
{
  "suggest": {
    "font": "OpenDyslexic" | "system" | null,
    "overlay": "#hex color" | null,
    "spacing": "wide" | "normal" | null
  },
  "reason": "one short sentence explaining why"
}

Guidelines:
- Dense academic/educational text → OpenDyslexic font + wide spacing
- Financial/numerical data → yellow overlay (#ffe066) to highlight numbers
- News articles → OpenDyslexic + normal spacing
- Light content → null suggestions (don't change anything)
Return null for a field if no change is needed.`;

export async function runAccessibilityAgent(
  payload: { contentType: string; sampleText: string },
  settings: DyslexAISettings
): Promise<AccessibilitySuggestPayload> {
  const apiKey = getApiKey(settings);
  if (!apiKey) {
    return { suggest: {}, reason: "No API key configured." };
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Content type: ${payload.contentType}\n\nSample text:\n${payload.sampleText.slice(0, 500)}`,
      },
    ],
  });

  try {
    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    return JSON.parse(text) as AccessibilitySuggestPayload;
  } catch {
    return { suggest: {}, reason: "Could not parse suggestion." };
  }
}
