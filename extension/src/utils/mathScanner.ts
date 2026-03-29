/**
 * Client-side math region scanner — no API key required.
 * Detects math-heavy paragraphs using keyword + pattern heuristics.
 * Used as a fallback when Coach Mode is enabled but AI scanner is unavailable,
 * and as a first-pass before sending to the AI Scanner Agent.
 */

const WORD_PROBLEM_KEYWORDS = [
  "how many", "how much", "total", "altogether", "in all", "difference",
  "more than", "less than", "fewer than", "times as many", "divided by",
  "multiplied by", "per cent", "percent", "%", "fraction", "ratio",
  "average", "mean", "sum", "product", "remainder", "equals", "calculate",
  "solve", "find the", "what is", "if there are", "if you have",
  "costs", "price", "each", "split", "share", "divided equally",
  "miles per", "miles an hour", "per hour", "per day", "interest rate",
];

const NUMBER_PATTERN = /\b\d+(?:[.,]\d+)?\b/g;
const FRACTION_PATTERN = /\b\d+\/\d+\b|\bhalf\b|\bthird\b|\bquarter\b/gi;
const PERCENTAGE_PATTERN = /\b\d+(?:\.\d+)?%/g;

export interface LocalScanRegion {
  element: Element;
  text: string;
  type: "word_problem" | "statistic" | "number_mention";
  confidence: number;
}

export function scanPageLocally(
  aggressiveness: "gentle" | "balanced" | "thorough"
): LocalScanRegion[] {
  const results: LocalScanRegion[] = [];
  const paragraphs = document.querySelectorAll("p, li, td, th, blockquote, article, section, div.content, .question, .problem");

  for (const el of Array.from(paragraphs)) {
    // Skip tiny or already-processed elements
    const text = el.textContent?.trim() || "";
    if (text.length < 20) continue;
    if (el.querySelector("[data-dyslexai-coach]")) continue;
    if (el.closest("[data-dyslexai-coach]")) continue;

    const score = scoreElement(text, aggressiveness);
    if (score === null) continue;

    results.push({ element: el, text: text.slice(0, 400), type: score.type, confidence: score.confidence });
  }

  return results;
}

function scoreElement(
  text: string,
  aggressiveness: "gentle" | "balanced" | "thorough"
): { type: "word_problem" | "statistic" | "number_mention"; confidence: number } | null {
  const lower = text.toLowerCase();

  // Count signals
  const numberMatches = (text.match(NUMBER_PATTERN) || []).length;
  const fractionMatches = (text.match(FRACTION_PATTERN) || []).length;
  const percentageMatches = (text.match(PERCENTAGE_PATTERN) || []).length;
  const keywordMatches = WORD_PROBLEM_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const hasQuestion = text.includes("?");

  // Word problem: keywords + question structure
  if (keywordMatches >= 2 && hasQuestion) {
    return { type: "word_problem", confidence: 0.85 };
  }
  if (keywordMatches >= 1 && numberMatches >= 2 && hasQuestion) {
    return { type: "word_problem", confidence: 0.75 };
  }

  if (aggressiveness === "gentle") return null;

  // Statistic: percentages or multiple numbers with comparisons
  if (percentageMatches >= 1 || fractionMatches >= 1) {
    return { type: "statistic", confidence: 0.7 };
  }
  if (numberMatches >= 3 && keywordMatches >= 1) {
    return { type: "statistic", confidence: 0.65 };
  }

  if (aggressiveness === "balanced") return null;

  // Thorough: any sentence with 2+ numbers
  if (numberMatches >= 2) {
    return { type: "number_mention", confidence: 0.5 };
  }

  return null;
}
