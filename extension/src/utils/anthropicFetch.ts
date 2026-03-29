/**
 * Shared Anthropic API fetch utility for background service worker context.
 * All agents use this instead of duplicating headers and error handling.
 * Uses plain fetch (not the SDK) to avoid MV3 bundling issues.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicRequest {
  apiKey: string;
  system: string;
  messages: AnthropicMessage[];
  maxTokens?: number;
}

export async function callAnthropicJSON<T>(req: AnthropicRequest): Promise<T> {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: req.maxTokens ?? 512,
      system: req.system,
      messages: req.messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${response.status}: ${err}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("No text in Anthropic response");
  return JSON.parse(text) as T;
}

export async function callAnthropicText(req: AnthropicRequest): Promise<string> {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: req.maxTokens ?? 512,
      system: req.system,
      messages: req.messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${response.status}: ${err}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("No text in Anthropic response");
  return text;
}
