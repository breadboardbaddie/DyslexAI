import { DyslexAISettings, getApiKey } from "../utils/storage";
import { ScanRequestPayload, ScanResultPayload } from "../utils/messages";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

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
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aggressiveness: ${payload.aggressiveness}\n\nText to scan:\n${payload.text.slice(0, 4000)}`,
        },
      ],
    }),
  });

  if (!response.ok) return { regions: [] };

  try {
    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "{}";
    return JSON.parse(text) as ScanResultPayload;
  } catch {
    return { regions: [] };
  }
}
