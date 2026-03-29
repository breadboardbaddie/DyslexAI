import { DyslexAISettings, getApiKey } from "../utils/storage";
import { ScanRequestPayload, ScanResultPayload } from "../utils/messages";
import { callAnthropicJSON } from "../utils/anthropicFetch";

const SYSTEM_PROMPT = `You are a math content scanner for a dyslexia/dyscalculia accessibility tool.
Analyze the provided text and identify regions containing:
- word_problem: A math problem written in plain language with a question or calculation required
- equation: A mathematical equation or formula
- statistic: A numeric fact, percentage, or comparison
- number_mention: Any mention of numbers in a quantitative context

Return ONLY valid JSON matching this schema:
{
  "regions": [
    {
      "text": "exact text from the input",
      "type": "word_problem | equation | statistic | number_mention",
      "confidence": 0.0-1.0,
      "domSelector": ""
    }
  ]
}

Aggressiveness levels:
- gentle: only flag clear word problems with explicit questions
- balanced: flag word problems + paragraphs with numeric calculations
- thorough: flag any sentence with numbers in quantitative context

Return {"regions": []} if nothing matches. Never include explanations outside JSON.`;

export async function runScannerAgent(
  payload: ScanRequestPayload,
  settings: DyslexAISettings
): Promise<ScanResultPayload> {
  const apiKey = getApiKey(settings);
  if (!apiKey) return { regions: [] };

  try {
    return await callAnthropicJSON<ScanResultPayload>({
      apiKey,
      system: SYSTEM_PROMPT,
      maxTokens: 1024,
      messages: [{ role: "user", content: `Aggressiveness: ${payload.aggressiveness}\n\nText to scan:\n${payload.text.slice(0, 4000)}` }],
    });
  } catch {
    return { regions: [] };
  }
}
