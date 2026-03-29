import { DyslexAISettings, getApiKey } from "../utils/storage";
import { AccessibilitySuggestPayload } from "../utils/messages";
import { callAnthropicJSON } from "../utils/anthropicFetch";

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

  try {
    return await callAnthropicJSON<AccessibilitySuggestPayload>({
      apiKey,
      system: SYSTEM_PROMPT,
      maxTokens: 256,
      messages: [{ role: "user", content: `Content type: ${payload.contentType}\n\nSample text:\n${payload.sampleText.slice(0, 500)}` }],
    });
  } catch {
    return { suggest: {}, reason: "Could not parse suggestion." };
  }
}
