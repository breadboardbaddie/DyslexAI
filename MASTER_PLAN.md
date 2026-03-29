# DyslexAI — Hackathon Master Plan

**Event:** Hackathon | **Date:** Sunday, March 29, 2026
**Build window:** 9:28 AM – 2:30 PM (~5 hours)
**Team:** Alexis (full duration) + Kyle arriving partway through

---

## 1. Vision Clarity

DyslexAI's north star: make any webpage on the web genuinely usable for people with dyslexia, dyscalculia, and numeric anxiety — without requiring them to leave the page, install a separate app, or ask for help.

Most web accessibility tooling is bolted on after the fact, hard to configure, and ignores math entirely. DyslexAI treats number comprehension as a first-class accessibility problem alongside reading. It ships as a Chrome extension so it works everywhere, with a companion web app that demonstrates the vision without requiring installation.

---

## 2. Problem Definition

**Who experiences this:** An estimated 15–20% of the population has dyslexia. Dyscalculia affects roughly 5–7%. These conditions co-occur frequently, and broader numeric anxiety is common among neurodivergent users. Every one of these users encounters text and numbers on the web daily — in news articles, forms, health information, financial content, and educational material.

**What the current experience looks like:** Standard websites render in fonts optimized for speed, not readability. Numbers appear inline with no visual scaffolding. There is no passive layer that adjusts spacing, overlays color, or makes a number like "forty-seven" visually grounded. AI tutoring tools exist, but none are embedded at the browser level to meet the user where the content already is.

---

## 3. Innovation

DyslexAI is not a tutorial clone. Its novel contributions:

- **Number Insight Popup with dot view:** Numbers are rendered as discrete dots (1–20) or grouped clusters (21+, configurable chunking in 5s/10s), giving dyscalculic users a spatial, subitizable representation of any number on any page.
- **Inline written-number detection:** The extension detects not just digits but written-out numbers ("forty-seven", "one hundred") via regex + NLP heuristics and treats them identically to numerals.
- **Multi-agent AI architecture at the browser layer:** Rather than a single AI prompt, Coach Mode uses four specialized agents (Scanner, Tutor, Accessibility, and a stretch-goal Confusion Detection agent) that pass structured messages. No other dyslexia tool does this.
- **Proactive accessibility suggestions:** The Accessibility Agent analyzes page content type and suggests Lens Mode adjustments without user prompting.

---

## 4. Technical Depth

**Chrome Extension (Manifest V3):** TypeScript + React + Vite. The content script is injected into every visited page. It traverses the DOM via TreeWalker, wraps matched text nodes in `<span>` elements with class markers, and attaches click handlers — all without breaking page layout or triggering reflows on unmodified nodes.

**Lens Mode DOM injection:** Font replacement is applied via a dynamically injected `<style>` tag with CSS custom properties. Spacing, line height, and overlay color are toggled the same way. OpenDyslexic is bundled as a web font asset within the extension package.

**Number detection:** A two-pass regex pipeline — pass one matches digit sequences and common formatted numbers (e.g., "1,200", "3.14"); pass two matches written-out English number words using a curated word list and compound pattern. Matched spans are tagged `data-dyslexai-number` and receive a highlight class.

**Number Insight Popup:** Rendered as a React portal injected adjacent to the clicked span. Dot view uses an SVG grid: 1–20 renders individual dots; 21+ renders rows of 5 or 10 with remainder, controlled by a chunking toggle stored in `chrome.storage.sync`. Audio is triggered via `window.speechSynthesis`.

**Multi-agent AI architecture (Coach Mode):**
- **Scanner Agent:** Receives serialized page text (or selected region), returns a structured JSON annotation: `{ regions: [{ text, type: "word_problem"|"equation"|"statistic", confidence }] }`. Highlighted regions are injected into the DOM.
- **Tutor Agent:** Maintains a conversation thread. Accepts user message or a "prompt me" trigger. Responds with Socratic scaffolding — breaking the problem into steps and asking one question at a time.
- **Accessibility Agent:** Receives content type metadata from Scanner and emits suggestions: `{ suggest: { font: "OpenDyslexic", overlay: "yellow", spacing: "wide" } }`. The extension UI toasts these suggestions non-intrusively.
- **Confusion Detection Agent (stretch goal):** Uses face-api.js in a background context with webcam access to score user facial expression every 5 seconds. If frustration confidence exceeds threshold, it dispatches a `TRIGGER_COACH` message to the content script.

All agents communicate via structured messages through the extension's background service worker using `chrome.runtime.sendMessage`. Claude API calls are made directly from the background worker using the user-supplied API key stored in `chrome.storage.sync`.

**Data models:**

```typescript
// Settings — persisted in chrome.storage.sync
interface DyslexAISettings {
  lensMode: {
    enabled: boolean;
    font: "system" | "OpenDyslexic" | "Arial" | "Verdana";
    letterSpacing: number;        // em units, 0–0.3
    wordSpacing: number;          // em units, 0–0.5
    lineHeight: number;           // 1.0–3.0
    overlayColor: string | null;  // hex or null
    highlightNumbers: boolean;
    numberHighlightColor: string;
  };
  coachMode: {
    enabled: boolean;
    aggressiveness: "gentle" | "balanced" | "thorough";
    apiKey: string;               // encrypted at rest
  };
  blockedDomains: string[];
  onboardingComplete: boolean;
}

// Agent message envelope — versioned for forward compatibility
interface AgentMessage {
  version: "1.0";
  type: "SCAN_REQUEST" | "SCAN_RESULT" | "TUTOR_MESSAGE" | "ACCESSIBILITY_SUGGEST" | "TRIGGER_COACH";
  payload: unknown;
  timestamp: number;
}

// Scanner Agent output
interface ScanResult {
  regions: Array<{
    text: string;
    type: "word_problem" | "equation" | "statistic" | "number_mention";
    confidence: number;           // 0–1
    domSelector: string;          // CSS selector to highlight element
  }>;
}

// Tutor Agent conversation turn
interface TutorTurn {
  role: "user" | "assistant";
  content: string;
  mode: "open" | "socratic";
}
```

**Companion web app:** Next.js (App Router) deployed to Vercel. Includes a landing page, an interactive Lens Mode demo on sample text (pure client-side, no extension required), and a download/install link.

---

## 5. Feasibility

This is honest: one developer cannot ship a polished production app in 5 hours. What is feasible:

- A working Chrome extension that loads, injects a content script, and applies Lens Mode on real pages.
- Number detection that handles digits and a subset of written-out numbers reliably.
- A functional Number Insight Popup with dot view and audio.
- Coach Panel that makes real Claude API calls and renders a Socratic conversation.
- Settings panel with persistence.
- A deployed Vercel landing page with a static Lens Mode demo.

What will be rough: edge cases in number detection, CSP-blocked sites, face-api.js integration. Those are explicitly descoped or marked stretch.

---

## 6. Team Execution Plan

| Time | Milestone | Owner |
|---|---|---|
| 9:30–10:15 | Extension scaffold: manifest, content script, Vite + React pipeline | Alexis |
| 10:15–11:00 | Lens Mode: font switching, number detection regex, highlight injection | Alexis |
| 11:00–11:45 | Number Insight Popup: dot view, chunking toggle, Web Speech API audio | Alexis |
| 11:45–12:30 | Multi-agent scaffold: Scanner + Tutor via Claude API, Coach Panel UI | Alexis |
| 12:30–1:15 | Settings panel, onboarding welcome flow, chrome.storage.sync persistence | Alexis |
| 1:15–1:45 | Companion Next.js app, Vercel deploy | Alexis |
| 1:45–2:15 | Testing, README, final commits, submission prep | Alexis |
| 2:15–2:30 | Buffer / polish | Alexis |
| TBD (friend arrives) | Confusion Detection Agent: face-api.js, webcam, frustration threshold dispatch | Teammate |

---

## 7. Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Content Security Policy blocks content script on target sites | Medium | Test on permissive sites first (Wikipedia, MDN); scope demo accordingly |
| Claude API latency degrades Coach Panel UX | Medium | Stream responses via SSE; show typing indicator; never block UI thread |
| Written-number regex misses edge cases or over-matches | High | Ship working subset (digits + simple compounds); flag ambiguous matches visually |
| face-api.js webcam feature incomplete | High | Explicitly a stretch goal; not required for submission; assigned to teammate |
| Vercel deploy fails or takes unexpected time | Low | Initialize and deploy the skeleton Next.js app in the first 30 minutes of the 1:15 slot; features can be added after |
| Extension build pipeline setup takes longer than expected | Low | Vite + React + MV3 is a known configuration; use a minimal template |

---

## 8. Scalability Design

The v1 architecture is designed to scale without rewriting:

- **Agent modularity:** Each Claude agent is a discrete async function with a defined input/output schema. Adding agents (e.g., a Language Simplification Agent or a PDF Agent) requires no changes to existing agents — only a new handler registered in the background service worker's message router.
- **Storage abstraction:** All reads/writes go through a thin `storage.ts` wrapper. Swapping `chrome.storage.sync` for a cloud backend (Supabase, Firebase) only requires changing that module.
- **Companion app:** The Next.js app is stateless in v1. It can gain API routes, a user account system, and a settings sync backend without restructuring the frontend.
- **Extension permissions:** Manifest V3 host permissions are declared broadly (`<all_urls>`). Additional features (e.g., PDF support via `webAccessibleResources`) can be added without re-architecting.
- **Model flexibility:** Claude API calls are routed through a single `callClaude(agent, prompt)` utility. Swapping models (e.g., upgrading to a newer Claude version, or routing heavy tasks to Opus and quick tasks to Haiku) requires changing one file.
- **Proxy-ready:** The API key field in settings is abstracted behind a `getApiKey()` function. Replacing it with a proxy endpoint in v2 is a one-line change.

---

## 9. Ecosystem Thinking

- **Agent protocol is open:** The `AgentMessage` envelope schema (versioned, typed, with structured payloads) is designed as a public protocol. A third-party developer could build a "Math Formula Renderer" agent or a "Simplify Language" agent and register it against the same background message router without touching core extension code.
- **API key model:** Users bring their own Claude key in v1. The `getApiKey()` abstraction makes a future hosted proxy tier (with rate limiting per install ID) a drop-in replacement.
- **Companion app as integration surface:** The Next.js app exposes the Lens Mode logic as a pure TypeScript module, making it importable by other web apps or educational platforms that want to embed DyslexAI's rendering capabilities.
- **Web platform standards:** The extension uses only standard DOM APIs, MutationObserver, and Web Speech API — no proprietary hooks. Porting to Firefox (Manifest V2/V3 hybrid) requires changes to ~3 Chrome-specific API calls.
- **Font extensibility:** OpenDyslexic is bundled, but the font system uses a CSS custom property (`--dyslexai-font-family`). Any additional font (Lexie Readable, Atkinson Hyperlegible) is addable as a new asset + one new settings enum value.
- **Accessibility standards alignment:** Lens Mode CSS overrides are designed to layer on top of existing ARIA and WCAG attributes, not replace them, ensuring compatibility with screen readers and other AT.

---

## 10. Market Awareness

**Market size:** ~1.1 billion people worldwide have some form of learning disability. In the US alone, ~43 million adults have dyslexia. The global assistive technology market is projected at $32B by 2027. Dyscalculia-specific tooling is effectively a zero-player market at the browser layer.

**Existing tools and their gaps:**

| Tool | What it does | What it misses |
|---|---|---|
| *Helperbird* | Broad accessibility extension (~500K users) | No AI coaching, no dyscalculia support, no number insight |
| *Beeline Reader* | Color gradient reading aid | No math support, no AI, reading only |
| *Natural Reader* | Text-to-speech browser extension | Not contextual, no accessibility layer, no math |
| *Microsoft Immersive Reader* | Full reading environment in MS products | Requires MS ecosystem, no browser-layer integration, no math tutoring |
| *Khan Academy / Photomath* | Step-by-step math tutoring | Separate platform — user must leave the page, not dyslexia-aware |
| *General AI chatbots* | Can explain anything if asked | Require copy-paste, no web integration, no accessibility layer |

**DyslexAI's position:** The only tool that combines passive visual accessibility (Lens Mode), active AI tutoring embedded at the browser layer (Coach Mode), and first-class dyscalculia support (Number Insight Popup) — working on any website without requiring the user to leave the page. The multi-agent architecture produces outputs that a single-prompt chatbot cannot match in specificity or adaptability.

---

## 11. User Impact

**Direct beneficiaries:**
- ~43M US adults with dyslexia; ~200M globally
- ~5–7% of the population with dyscalculia — roughly 400M people worldwide
- Broader neurodivergent population (ADHD ~366M adults globally, autism ~78M) who benefit from reduced visual noise and scaffolded comprehension
- Students at all levels encountering math in online coursework
- Adults navigating financial, health, and civic information online daily

**Measurable improvement per user session:**
- Lens Mode eliminates the need to copy text into a separate app for reading accommodation — reducing task-switching friction from ~4 steps to zero.
- Number Insight Popup converts an opaque digit into a spatially grounded visual representation in one click — removing the need to open a calculator or look up a definition.
- Coach Mode replaces a Google search + forum browse (average: 8–12 minutes, low personalization) with an in-context, adaptive explanation in under 60 seconds.

**Who can use it starting Monday morning:** Any Chrome user with dyslexia or dyscalculia. No account, no onboarding beyond a 2-minute setup, works on every website they already visit.

---

## 12. Differentiation Strategy

DyslexAI is differentiated on three axes no competitor currently combines:

1. **Dyscalculia as a first-class citizen.** The Number Insight Popup and written-number detection are purpose-built for numeric comprehension, not reading fluency alone.
2. **AI coaching at the browser layer.** Coach Mode works on any page — not just educational platforms — because it is embedded in the browser, not the content.
3. **Multi-agent specialization.** The Scanner, Tutor, and Accessibility agents each do one job well. This produces more reliable, contextually appropriate outputs than a single general-purpose prompt.

---

## Out of Scope for v1

The following are explicitly not in scope and will not be attempted:

- Proxy backend (users supply their own Claude API key)
- Firefox or Safari support
- User accounts or cloud sync
- Mobile support
- Export/import of settings
- face-api.js Confusion Detection Agent (stretch goal, assigned to teammate if time permits)
