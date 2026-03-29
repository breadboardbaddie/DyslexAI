import { detectNumbers } from "../utils/numberDetection";

const ATTR = "data-dyslexai-number";

export function highlightNumbers(
  onNumberClick: (value: string, numericValue: number | null, el: HTMLElement) => void
): void {
  clearNumberHighlights();
  walkTextNodes(document.body, onNumberClick);
}

export function clearNumberHighlights(): void {
  document.querySelectorAll(`[${ATTR}]`).forEach((el) => {
    const parent = el.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(el.textContent || ""), el);
      parent.normalize();
    }
  });
}

function walkTextNodes(
  root: Node,
  onNumberClick: (value: string, numericValue: number | null, el: HTMLElement) => void
): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      // Skip script, style, and already-processed nodes
      if (
        tag === "script" ||
        tag === "style" ||
        tag === "noscript" ||
        parent.hasAttribute(ATTR) ||
        parent.closest(`[${ATTR}]`)
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodesToProcess: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    nodesToProcess.push(node as Text);
  }

  for (const textNode of nodesToProcess) {
    processTextNode(textNode, onNumberClick);
  }
}

function processTextNode(
  textNode: Text,
  onNumberClick: (value: string, numericValue: number | null, el: HTMLElement) => void
): void {
  const text = textNode.textContent || "";
  const numbers = detectNumbers(text);
  if (numbers.length === 0) return;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const num of numbers) {
    if (num.start > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, num.start)));
    }

    const span = document.createElement("span");
    span.className = "dyslexai-number";
    span.setAttribute(ATTR, "true");
    span.setAttribute("data-dyslexai-value", String(num.numericValue ?? ""));
    span.setAttribute("data-dyslexai-raw", num.value);
    span.textContent = num.value;
    span.addEventListener("click", (e) => {
      e.stopPropagation();
      onNumberClick(num.value, num.numericValue, span);
    });

    fragment.appendChild(span);
    lastIndex = num.end;
  }

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  textNode.parentNode?.replaceChild(fragment, textNode);
}
