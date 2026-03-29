import { DyslexAISettings, getApiKey } from "../utils/storage";
import { AccessibilitySuggestPayload } from "../utils/messages";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

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
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Content type: ${payload.contentType}\n\nSample text:\n${payload.sampleText.slice(0, 500)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return { suggest: {}, reason: "API request failed." };
  }

  try {
    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "{}";
    return JSON.parse(text) as AccessibilitySuggestPayload;
  } catch {
    return { suggest: {}, reason: "Could not parse suggestion." };
  }
}
