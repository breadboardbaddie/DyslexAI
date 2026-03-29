# DyslexAI — Product Vision Prompt

> This prompt is used to generate `docs/vision.md`. Do not execute until reviewed and approved.

---

## Prompt

You are a senior product strategist and UX designer specializing in accessibility technology and neurodivergent learning tools. Your task is to write a comprehensive, well-structured **product vision document** for a browser extension called **DyslexAI**.

Use the full context below to produce `docs/vision.md`. The document should be detailed enough to guide a software engineering spec, a full product backlog, and a multi-sprint build plan.

---

### What is DyslexAI?

DyslexAI is a **Chrome browser extension** designed to make the web more accessible for people with dyslexia, dyscalculia (numeric dyslexia), low math confidence, and other neurodivergent learning differences. It meets users where they are — on any website, in any context — and gives them real-time tools to understand and process both text and numbers more comfortably.

The extension has two distinct modes that can be used independently or together:

---

### Mode 1: Lens Mode (Passive Accessibility Layer)

Lens Mode transforms how any webpage looks and feels. It is always-on and requires no active interaction from the user once configured.

**Text accessibility features:**
- Font switching, including the OpenDyslexic font for all body text
- Adjustable letter spacing, word spacing, and line height
- Colored reading overlays (full-page tints in user-selected colors to reduce visual stress)
- Line focus highlight that follows the reader's position on the page
- High-contrast mode and custom background/text color pairings

**Number accessibility features:**
- Automatic detection and highlighting of all numbers on the page — both digits (e.g., `47`) and numbers written as words (e.g., "forty-seven")
- User-configurable highlight color and style for detected numbers
- All number highlights are clickable — clicking opens the **Number Insight Popup**

**Number Insight Popup:**
When a user clicks any highlighted number, a small popup appears adjacent to it. The popup offers three views the user can scroll between:

1. **Dot View** — a visual dot representation of the number:
   - For numbers 1–20: individual dots laid out clearly
   - For numbers 21+: grouped dots in sets of 5 or 10 (like dice faces or tally marks)
   - Within the popup, a button lets the user progressively break grouped dots into smaller and smaller clusters, giving them control over how they chunk the number
2. **Audio View** — the number is spoken aloud clearly using text-to-speech (e.g., the Web Speech API or a similar browser-native solution)
3. **Style View** — controls to change the font, color, size, and highlight style of that number (and optionally all numbers on the page)

---

### Mode 2: Coach Mode (Active AI Tutoring Layer)

Coach Mode is the intelligent, interactive layer. It monitors page content for math-related language and word problems, and offers real-time scaffolded tutoring powered by the Claude API (Anthropic).

**Word problem detection:**
- The extension automatically scans page text for mathematical language: word problems, numeric comparisons, percentages, fractions, unit conversions, and quantitative reasoning in sentences
- Detected regions are highlighted on the page with a distinct visual indicator (different from the Lens Mode number highlight)
- The aggressiveness of this detection is configurable by the user at three levels:
  - **Gentle** — only flags clear, explicit math word problems with an obvious question structure
  - **Balanced** — flags word problems and any paragraph containing a numeric calculation or comparison
  - **Thorough** — flags any sentence or passage that includes numbers in a quantitative or relational context

**Tutoring interaction:**
- Clicking a highlighted region opens the **Coach Panel** — a clean, conversational interface that slides in from the side of the screen
- The default state invites the user to **ask their own question** about the highlighted content (open-ended, low-pressure entry point)
- A secondary button lets the user ask the AI to **guide them with a question** (Socratic mode — the AI asks them something to help them start thinking)
- The conversation is fully back-and-forth: the user and the AI take turns, the AI adapts its language to the user's apparent comfort level, and responses are always encouraging and non-judgmental
- The AI breaks problems into **incremental steps**, never giving away full answers unless explicitly asked, always checking for understanding
- The Coach Panel remembers the context of the current highlighted passage throughout the conversation

---

### Onboarding & Settings

**First-launch welcome flow:**
When a user installs DyslexAI for the first time, they are greeted with a clean, friendly welcome page (a Chrome extension onboarding tab) that:
1. Briefly explains what DyslexAI does in plain language
2. Asks which mode(s) they want to enable (Lens Mode, Coach Mode, or both)
3. If Coach Mode is enabled, asks them to select their detection aggression level (Gentle / Balanced / Thorough)
4. Offers a few quick preference presets (e.g., "I mainly struggle with reading", "I mainly struggle with numbers", "Both") that pre-configure sensible defaults for fonts, colors, and detection settings
5. Ends with a "You're ready!" confirmation and opens a sample page to demonstrate the extension in action

**Settings panel:**
Clicking the DyslexAI extension icon opens a persistent settings panel. All settings are organized under Lens Mode and Coach Mode tabs. Every setting persists across all websites using `chrome.storage.sync`. Users can also:
- Manually block or allow specific websites
- Reset all settings to defaults
- Export/import their settings profile

---

### Target Users

- People with dyslexia who struggle with reading text on the web
- People with dyscalculia or low math confidence who find numbers and word problems anxiety-inducing
- Neurodivergent individuals (ADHD, autism spectrum, processing differences) who benefit from customized visual environments
- Students of all ages encountering math in online educational content
- Adults who encounter quantitative content at work or in daily life and want a low-pressure way to engage with it

---

### Technical Constraints & Decisions

- **Platform:** Chrome browser extension, Manifest V3
- **AI:** Claude API (Anthropic) for all Coach Mode tutoring interactions
- **Text-to-speech:** Web Speech API (browser-native, no external dependency) for Audio View in the Number Insight Popup
- **Storage:** `chrome.storage.sync` for all user settings (syncs across devices where the user is signed into Chrome)
- **Tech stack:** TypeScript, React (for popup and settings UI), Vite (for extension bundling)
- **Font:** OpenDyslexic (open license, bundled with the extension)
- **No login required** — the extension works without an account; the user provides their own Claude API key in the settings panel (v1). A managed proxy backend is explicitly deferred to a future version.

---

### Vision Document Structure

Please produce `docs/vision.md` with the following sections:

1. **Executive Summary** — what DyslexAI is, who it's for, and why it matters
2. **Problem Statement** — the specific pain points this tool addresses, with context on dyslexia, dyscalculia, and the current lack of accessible web tooling
3. **Product Vision** — a clear, inspiring statement of what DyslexAI will become
4. **Core Features** — detailed breakdown of Lens Mode and Coach Mode features
5. **User Personas** — 3–4 detailed personas representing key user types
6. **User Journeys** — 2–3 end-to-end scenarios showing how a user interacts with the extension from install through daily use
7. **Design Principles** — the values that should guide every UI and feature decision (e.g., never shame the user, reduce friction, always give control)
8. **Success Metrics** — how we'll know the product is working (engagement, accessibility outcomes, user satisfaction)
9. **Out of Scope (v1)** — features explicitly deferred to future versions
10. **Open Questions** — unresolved decisions that will need answers before or during engineering
