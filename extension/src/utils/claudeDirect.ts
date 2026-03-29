/**
 * Direct Claude API caller — runs in content script context.
 * Bypasses the background service worker entirely to avoid MV3 service worker
 * lifecycle issues (worker killed mid-call = response never arrives).
 *
 * Content scripts with <all_urls> host permissions can fetch api.anthropic.com directly.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeRequest {
  apiKey: string;
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
}

export async function callClaude(req: ClaudeRequest): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
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
    console.error("[DyslexAI] Claude API raw error:", response.status, err);
    throw new Error(`${response.status}: ${err}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("No text in Claude response");
  return text;
}
