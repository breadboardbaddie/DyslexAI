// Two-pass number detection pipeline
// Pass 1: digits and formatted numbers (1,200 / 3.14 / 47%)
// Pass 2: written-out English number words

const DIGIT_PATTERN =
  /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|\b\d+(?:\.\d+)?%?\b/g;

const NUMBER_WORDS = [
  "zero","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
  "seventeen","eighteen","nineteen","twenty","thirty","forty","fifty",
  "sixty","seventy","eighty","ninety","hundred","thousand","million",
  "billion","half","quarter","third","double","triple",
];

const WORD_NUMBER_PATTERN = new RegExp(
  `\\b(?:${NUMBER_WORDS.join("|")})(?:[\\s-](?:${NUMBER_WORDS.join("|")}))*\\b`,
  "gi"
);

export interface DetectedNumber {
  value: string;
  numericValue: number | null;
  start: number;
  end: number;
}

const WORD_TO_NUM: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
  twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, million: 1000000, billion: 1000000000,
};

export function parseWordNumber(text: string): number | null {
  const words = text.toLowerCase().replace(/-/g, " ").split(/\s+/);
  let result = 0;
  let current = 0;
  for (const word of words) {
    const val = WORD_TO_NUM[word];
    if (val === undefined) return null;
    if (val === 100) {
      current = current === 0 ? 100 : current * 100;
    } else if (val >= 1000) {
      result += (current === 0 ? 1 : current) * val;
      current = 0;
    } else {
      current += val;
    }
  }
  return result + current;
}

export function detectNumbers(text: string): DetectedNumber[] {
  const results: DetectedNumber[] = [];
  const seen = new Set<number>();

  // Pass 1: digit patterns
  let match: RegExpExecArray | null;
  DIGIT_PATTERN.lastIndex = 0;
  while ((match = DIGIT_PATTERN.exec(text)) !== null) {
    const raw = match[0].replace(/[,%]/g, "");
    const num = parseFloat(raw);
    results.push({
      value: match[0],
      numericValue: isNaN(num) ? null : num,
      start: match.index,
      end: match.index + match[0].length,
    });
    seen.add(match.index);
  }

  // Pass 2: written-out numbers
  WORD_NUMBER_PATTERN.lastIndex = 0;
  while ((match = WORD_NUMBER_PATTERN.exec(text)) !== null) {
    if (!seen.has(match.index)) {
      results.push({
        value: match[0],
        numericValue: parseWordNumber(match[0]),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return results.sort((a, b) => a.start - b.start);
}

export function numericValueFromString(s: string): number | null {
  const clean = s.replace(/[,%]/g, "");
  const n = parseFloat(clean);
  if (!isNaN(n)) return n;
  return parseWordNumber(s);
}
