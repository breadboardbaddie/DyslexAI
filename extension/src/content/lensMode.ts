import { DyslexAISettings } from "../utils/storage";

const STYLE_ID = "dyslexai-lens-style";
const OVERLAY_ID = "dyslexai-overlay";
const FONT_FACE = `
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${chrome.runtime.getURL("assets/fonts/OpenDyslexic-Regular.otf")}') format('opentype');
  font-weight: normal;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${chrome.runtime.getURL("assets/fonts/OpenDyslexic-Bold.otf")}') format('opentype');
  font-weight: bold;
}
`;

export function applyLensMode(settings: DyslexAISettings): void {
  const { lensMode } = settings;

  // Remove previous styles
  removeLensMode();

  if (!lensMode.enabled) return;

  const fontFamily =
    lensMode.font === "OpenDyslexic"
      ? "'OpenDyslexic', sans-serif"
      : lensMode.font === "Arial"
      ? "Arial, sans-serif"
      : lensMode.font === "Verdana"
      ? "Verdana, sans-serif"
      : "inherit";

  // Only override spacing values the user has explicitly set (non-zero)
  const spacingRules = [
    lensMode.letterSpacing > 0 ? `letter-spacing: ${lensMode.letterSpacing}em !important;` : "",
    lensMode.wordSpacing > 0 ? `word-spacing: ${lensMode.wordSpacing}em !important;` : "",
    lensMode.lineHeight > 0 ? `line-height: ${lensMode.lineHeight} !important;` : "",
  ].filter(Boolean).join("\n      ");

  const fontRule = fontFamily !== "inherit"
    ? `font-family: ${fontFamily} !important;`
    : "";

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ${lensMode.font === "OpenDyslexic" ? FONT_FACE : ""}
    :root {
      --dyslexai-number-highlight: ${lensMode.numberHighlightColor};
      --dyslexai-number-highlight-hover: ${lensMode.numberHighlightColor}cc;
    }
    ${fontRule || spacingRules ? `html body, html body * {
      ${fontRule}
      ${spacingRules}
    }` : ""}
  `;
  document.head.appendChild(style);

  // Color overlay
  if (lensMode.overlayColor) {
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.style.backgroundColor = lensMode.overlayColor + "33"; // 20% opacity
    document.body.appendChild(overlay);
  }
}

export function removeLensMode(): void {
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById(OVERLAY_ID)?.remove();
}

export function updateNumberHighlightColor(color: string): void {
  document.documentElement.style.setProperty("--dyslexai-number-highlight", color);
}
