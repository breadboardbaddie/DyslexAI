# DyslexAI

**Live:** https://dyslexai-five.vercel.app

A Chrome browser extension that makes any webpage genuinely accessible for people with dyslexia, dyscalculia, and numeric anxiety — without leaving the page.

---

## What it does

DyslexAI operates at the browser layer with two modes:

### Lens Mode (passive)
- Replaces fonts with **OpenDyslexic**, Arial, or Verdana across any webpage
- Adjusts letter spacing and line height to reduce visual crowding
- Applies a color overlay tint to reduce contrast glare
- Highlights all numbers on the page in a customizable color
- Click any highlighted number to open the **Number Insight Popup**

### Number Insight Popup
- Converts any number into a spatially grounded **dot-grid visualization** (groups of 5, color-coded by row)
- Reads the number aloud via the **Web Speech API**
- Shows font/style controls for inline adjustment

### Coach Mode (active AI tutoring)
- Scans the page for word problems, equations, statistics, and number mentions
- Marks detected regions with a hover pill ("💬 Ask Coach")
- Clicking opens the **Coach Panel** — a Socratic AI tutor powered by Claude
- Streaming responses render word-by-word for a natural feel
- Two interaction modes: **Socratic** (guided questioning) and **Open** (direct answer)
- Falls back to pre-written scaffolding questions when no API key is configured

---

## Architecture

```
extension/
├── src/
│   ├── background/       # MV3 service worker — routes Claude API calls via port
│   ├── agents/           # Multi-agent system
│   │   ├── scannerAgent.ts           # Detects math regions on page
│   │   ├── tutorAgent.ts             # Socratic tutoring with fallback questions
│   │   ├── accessibilityAgent.ts     # Suggests Lens Mode settings per page type
│   │   └── confusionDetectionAgent.ts  # (stretch) face-api.js emotion detection
│   ├── components/
│   │   ├── CoachPanel.tsx    # Streaming AI tutor sidebar
│   │   └── NumberPopup.tsx   # Dot-grid number visualization
│   ├── content/          # Content script — injected into every page
│   │   ├── index.tsx         # Main entry: scan, highlight, open panel
│   │   ├── lensMode.ts       # Non-destructive CSS injection
│   │   └── numberHighlighter.ts  # TreeWalker DOM traversal + click handlers
│   ├── popup/            # Extension toolbar popup (quick settings)
│   ├── options/          # Full settings page + onboarding flow
│   └── utils/
│       ├── storage.ts            # chrome.storage.sync wrapper + DyslexAISettings type
│       ├── messages.ts           # Typed AgentMessage envelope (versioned)
│       ├── numberDetection.ts    # Two-pass regex: digits + written words ("forty-seven")
│       └── mathScanner.ts        # Client-side math region detector (no API key needed)
```

**Key architectural decisions:**
- All Claude API calls route through the **background service worker via `chrome.runtime.connect()`** to bypass CORS restrictions in content scripts
- Keepalive pings every 20s prevent the MV3 service worker from being killed mid-stream
- Streaming SSE responses are parsed in the background and forwarded as chunks via the port
- The Anthropic SDK is intentionally **not used** in the background worker — plain `fetch()` avoids MV3 bundling issues
- Number detection runs in **two passes**: digit/formatted numbers first, then written English words (`forty-seven`, `one hundred`, etc.)
- All spacing CSS is injected only when value is `> 0` — never overrides page defaults

---

## Setup

### Prerequisites
- Node.js 18+
- A Claude API key from [console.anthropic.com](https://console.anthropic.com) (Coach Mode only — Lens Mode works without one)

### Install & build

```bash
cd extension
npm install
npm run build
```

The compiled extension is output to `extension/dist/`.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder

### Development (watch mode)

```bash
cd extension
npm run dev
```

---

## Configuration

All settings persist via `chrome.storage.sync` across devices.

### Lens Mode

| Setting | Default | Description |
|---|---|---|
| Font | system | Page font override (OpenDyslexic, Arial, Verdana) |
| Letter spacing | 0 (off) | Extra spacing between letters (0–0.3em) |
| Line height | 0 (off) | Line height multiplier (1.0–3.0) |
| Highlight numbers | off | Color-highlight all numbers on page |
| Overlay tint | none | Full-page color overlay for contrast reduction |

### Coach Mode

| Setting | Default | Description |
|---|---|---|
| Detection level | balanced | gentle / balanced / thorough |
| Claude API key | — | Your key from console.anthropic.com |

### Adding your API key
1. Click the DyslexAI icon in the Chrome toolbar
2. Enable Coach Mode
3. Paste your Claude API key (`sk-ant-...`)
4. Click **Open Coach on this page →** or hover any highlighted math region and click the pill

---

## Multi-agent system

Coach Mode uses four specialized Claude agents:

| Agent | Role |
|---|---|
| **Scanner** | Analyzes page text, classifies regions (word problem, equation, statistic, number mention) |
| **Tutor** | Conducts Socratic tutoring conversations with real-time streaming responses |
| **Accessibility** | Suggests optimal Lens Mode settings based on page content type |
| **Confusion Detection** | *(stretch goal)* Uses face-api.js to detect confusion and proactively offer help |

All agents communicate via a versioned `AgentMessage` envelope:

```typescript
interface AgentMessage<T = unknown> {
  version: "1.0";
  type: AgentMessageType;
  payload: T;
  timestamp: number;
}
```

Adding a new agent requires only:
1. Create `src/agents/yourAgent.ts`
2. Add your type to `utils/messages.ts`
3. Handle it in `background/index.ts`

No content script or UI changes needed for agent-only features.

---

## Tech stack

| Layer | Tech |
|---|---|
| Extension | TypeScript + React 18 + Vite 5 + @crxjs/vite-plugin |
| AI | Claude Haiku (claude-haiku-4-5-20251001) via Anthropic API |
| Companion app | Next.js on Vercel |
| Manifest | Chrome MV3 |

---

## Browser support

- **Chrome 114+** (Manifest V3) — fully supported
- Firefox — planned (~3 Chrome-specific API surface changes required)