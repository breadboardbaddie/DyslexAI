# DyslexAI — Product Vision Document

**Version:** 1.0
**Date:** March 29, 2026
**Status:** Draft — Pre-Engineering

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Core Features](#4-core-features)
5. [User Personas](#5-user-personas)
6. [User Journeys](#6-user-journeys)
7. [Design Principles](#7-design-principles)
8. [Success Metrics](#8-success-metrics)
9. [Out of Scope (v1)](#9-out-of-scope-v1)
10. [Open Questions](#10-open-questions)

---

## 1. Executive Summary

DyslexAI is a Chrome browser extension that transforms the web into an accessible, low-stress reading and learning environment for people with dyslexia, dyscalculia, and related neurodivergent learning differences. It works on any website, in any context, without requiring users to change how or where they browse.

The extension operates in two complementary modes. Lens Mode is a passive accessibility layer that modifies how any webpage looks and feels — adjusting typography, applying color overlays, highlighting numbers, and offering visual representations of numeric values. Coach Mode is an active AI tutoring layer that detects mathematical language and word problems in page content and opens a conversational, Socratic tutoring interface powered by the Claude API.

Together, these modes address two deeply underserved needs: the need for low-friction reading accommodations that follow users across the entire web, and the need for patient, non-judgmental math support that meets people in the moment they need it, not in a separate app or classroom.

**Who it's for:** People with dyslexia, dyscalculia, ADHD, and other processing differences — including students navigating online coursework, adults managing numbers in work and daily life, and anyone who experiences anxiety or confusion around reading or quantitative content on the web.

**Why it matters:** Roughly 15–20% of the population experiences some form of dyslexia. Dyscalculia affects approximately 3–7% of people, yet it receives far less attention and far fewer dedicated tools than dyslexia. The web — where most learning, work, and civic participation now happens — remains largely inaccessible to this population. DyslexAI closes that gap.

---

## 2. Problem Statement

### 2.1 The Scale of the Challenge

Dyslexia is one of the most common neurodevelopmental conditions, affecting an estimated 15–20% of the global population to varying degrees. It is not a measure of intelligence — it is a difference in how the brain processes written language. People with dyslexia frequently struggle with letter reversals, visual crowding (where letters blur or shift), slow reading pace, and working-memory load when decoding text. These difficulties compound in digital environments, where font choices, dense line spacing, and high-contrast black-on-white text are the default.

Dyscalculia — sometimes called numeric dyslexia — is less widely recognized but similarly impactful. It affects how people perceive, remember, and manipulate numbers. Someone with dyscalculia may be intelligent and verbally fluent yet find it genuinely difficult to compare two prices, estimate a percentage tip, or parse a sentence like "the project is 40% complete with 3 weeks remaining." This difficulty is not laziness or lack of effort; it reflects a real difference in how numerical quantity is processed by the brain.

### 2.2 Specific Pain Points

**For people with dyslexia:**
- Most websites use fonts, spacing, and color schemes that maximize visual stress for dyslexic readers
- Existing accessibility tools (OS-level screen readers, browser zoom) are blunt instruments that change the entire browsing experience rather than tuning it
- Specialized reading apps require users to copy content out of the browser and into a separate environment, breaking flow entirely
- Many dyslexia tools exist for dedicated reading apps or e-readers but do not work across the open web

**For people with dyscalculia and low math confidence:**
- Numbers appear constantly on the web — in news articles, product pages, financial dashboards, educational content, recipes, health information — and there is almost no tooling to help users understand them contextually
- When a word problem or quantitative comparison appears in a page, users have no in-context support; they must leave the page, open a calculator, search for a tutor, or simply give up
- Existing math tutoring tools (Khan Academy, Photomath) require deliberate navigation to a separate platform. They do not meet users where they are
- The emotional dimension of math anxiety is rarely addressed by tools that are purely functional; users need patient, non-judgmental support, not just answers

**For neurodivergent users broadly:**
- The web is designed for neurotypical users: dense text, no visual hierarchy, no scaffolding, no patience
- ADHD compounds both reading and math difficulties through executive function and attention challenges
- Many users have spent years being told they are "bad at reading" or "bad at math" and carry significant shame and anxiety into any interaction with these subjects

### 2.3 The Gap in Current Tooling

| Tool Category | What It Does | What It Misses |
|---|---|---|
| OS accessibility features | High contrast, zoom, screen reader | No dyslexia-specific typography; no math support |
| Browser read-aloud extensions | Reads selected text aloud | No visual formatting; no math explanation |
| OpenDyslexic browser extension | Switches font to OpenDyslexic | No number support; no AI layer; limited settings |
| Dedicated reading apps (e.g., Immersive Reader) | Full reading environment | Requires leaving the browser; no math tutoring |
| Math tutoring platforms | Step-by-step math help | Separate platform; not integrated into browsing |
| General AI chatbots (ChatGPT, Claude.ai) | Can explain math | Requires copy-pasting; no web integration; no accessibility layer |

No existing tool combines real-time reading accommodations, visual number support, and in-context AI math tutoring in a single, passive, always-available browser extension. DyslexAI occupies that gap entirely.

---

## 3. Product Vision

**Vision Statement:**

> DyslexAI makes every corner of the web readable, numerable, and navigable for the one in five people whose brains process information differently. We believe accessibility is not a feature to be unlocked by filing a support ticket — it is a right, and it should work everywhere, automatically, without asking users to justify their needs or change their habits. DyslexAI is the quiet, patient layer between a user and the web: always present, never intrusive, and ready to help the moment it's needed.

**North Star:**

A student with dyslexia and dyscalculia opens their school's online learning portal on a Monday morning. Without doing anything, the page reflows into their preferred font and color scheme. When they hit a word problem about calculating percentages, a gentle highlight appears. They tap it, ask a question in their own words, and the AI walks them through the concept step by step — never condescending, never rushing. Ten minutes later they understand the concept and move on. They did not leave the page, open a new tab, or feel ashamed. That is the experience DyslexAI exists to create.

---

## 4. Core Features

### 4.1 Lens Mode — Passive Accessibility Layer

Lens Mode is always-on once configured. It requires no active engagement from the user after initial setup and operates invisibly across every website the user visits (subject to their allow/block list).

#### 4.1.1 Text Accessibility

**Font Switching**
Users can replace any webpage's body font with a selection of accessibility-optimized typefaces. The primary offering is OpenDyslexic, a freely licensed font specifically designed to reduce letter reversals and visual crowding by weighting the bottoms of characters for orientation stability. Additional standard fonts (Arial, Verdana, Georgia) are available for users who prefer a cleaner sans-serif or serif without the visual weight of OpenDyslexic.

**Spacing Controls**
Three independent spacing controls allow fine-grained typographic adjustment:
- Letter spacing (tracking): increases the horizontal gap between individual characters, reducing crowding
- Word spacing: increases the gap between words, improving word boundary recognition
- Line height (leading): increases vertical space between lines, reducing text from feeling like a dense visual block

All three controls are exposed as sliders with labeled presets (Default, Comfortable, Spacious) alongside continuous fine-tuning.

**Colored Reading Overlays**
A full-page color tint overlay reduces the high-contrast white background that causes visual stress (Meares-Irlen syndrome overlap) for many dyslexic readers. Users can select from a palette of clinically suggested overlay colors (yellow, blue, pink, green, peach) and adjust tint opacity. The overlay applies uniformly across the entire page without altering text content or images.

**Line Focus Highlight**
A horizontal highlight band that follows the user's reading position on the page, dimming content above and below the focal line. This helps users with tracking difficulties maintain their place in long passages. The highlight moves with the user's scroll position and can be toggled on or off at any time via a keyboard shortcut.

**High-Contrast Mode and Custom Color Pairings**
Separate from the overlay, users can configure custom background and text color combinations. Presets include dark mode (white text on dark gray), high contrast (black on yellow), and soft contrast (dark brown on cream), alongside a fully custom picker.

#### 4.1.2 Number Detection and Highlighting

**Automatic Number Detection**
Lens Mode scans all text nodes on the page and applies a highlight to detected numbers. Detection covers:
- Numeric digits and multi-digit numbers (e.g., 4, 47, 1,200, 3.14)
- Numbers written as English words (e.g., "forty-seven", "a hundred", "three-quarters")
- Common mixed formats (e.g., "4.5 million", "1 in 5", "$3.99")

Highlights are non-destructive — they do not alter page layout or change number values, they only apply a colored background or underline via injected CSS.

**Configurable Highlight Style**
Users can configure the color and style of number highlights (background highlight, underline, bold, colored text). A separate highlight style can be applied to digit-form numbers versus word-form numbers if the user prefers visual distinction.

**Clickable Number Highlights**
Every highlighted number is interactive. Clicking opens the Number Insight Popup.

#### 4.1.3 Number Insight Popup

A small, floating UI element that appears adjacent to any clicked number. The popup does not obscure the surrounding text and can be dismissed by clicking elsewhere. It contains three scrollable views:

**Dot View**
A visual representation of the number's magnitude using dots:
- Numbers 1–20: individual dots arranged in a clear spatial layout (rows of 5, visually similar to a number line or ten-frame)
- Numbers 21–100: grouped dots in clusters of 5 or 10, visually styled like dice faces or tally marks
- Numbers above 100: grouped representations with a label indicating scale (e.g., "each cluster = 10")

A progressive breakdown button lets the user split clusters into smaller groups iteratively, giving them control over how they chunk large numbers. For example, a representation of 40 showing four groups of 10 can be broken into eight groups of 5, then into forty individual dots, then back to four groups of 10 — cycling through chunking strategies.

**Audio View**
The number is read aloud using the Web Speech API. The spoken number uses natural language (e.g., "forty-seven" not "four seven"). For numbers written as words on the page, the audio confirms the numeric value. For decimal or fractional numbers, the audio speaks the full value clearly (e.g., "three point one four" or "one half"). The user can replay audio as many times as needed.

**Style View**
A miniature settings panel embedded in the popup that allows real-time adjustment of:
- The font used for this number (and optionally all numbers on the page)
- The font size (numbers can be made larger than surrounding body text)
- The highlight color and style
- An option to apply these settings globally to all numbers on the page

Changes made in Style View persist via chrome.storage.sync.

---

### 4.2 Coach Mode — Active AI Tutoring Layer

Coach Mode adds an intelligent, conversational layer on top of Lens Mode. It actively scans page content for mathematical language and word problems, offers visual entry points for AI-assisted tutoring, and provides a full conversational interface powered by the Claude API.

#### 4.2.1 Word Problem Detection

**Detection Engine**
Coach Mode scans visible text content on the page for mathematical language using a combination of pattern matching and heuristic rules. Detection identifies:
- Traditional math word problems (e.g., "If a train leaves Chicago at 3pm...")
- Numeric comparisons in prose (e.g., "Product A costs $24 while Product B costs $31...")
- Percentage, fraction, and ratio language (e.g., "40% of respondents said...")
- Unit conversion contexts (e.g., "the dosage is 500mg per day for a 70kg adult")
- Quantitative reasoning embedded in narrative (e.g., "If you invest $1,000 at 5% interest for 10 years...")

**Configurable Detection Sensitivity**
Users choose from three detection levels:

- **Gentle:** Only flags passages that have a clear, explicit question structure — typically traditional word problems with a question mark and identifiable unknown. Produces minimal false positives. Best for users who want minimal interruption and only need help with obvious math questions.

- **Balanced:** Flags word problems and any paragraph containing a numeric calculation, comparison, or quantitative claim. Catches most scenarios where a user might benefit from support without flagging purely incidental numbers (e.g., a publication date or phone number). Recommended default.

- **Thorough:** Flags any sentence or passage that includes numbers in a relational or quantitative context, including statistics, measurements, financial figures, and data. Maximum coverage; may produce false positives. Best for users with high math anxiety who want to feel supported whenever numbers appear in meaningful context.

**Visual Indicators**
Detected regions are marked with a subtle left-border accent and a small icon in the page margin. The indicator is visually distinct from Lens Mode number highlights to avoid confusion. Indicators do not alter page layout or text.

#### 4.2.2 Coach Panel

Clicking any detected region opens the Coach Panel — a sliding side panel that appears at the right edge of the browser window without opening a new tab or covering the original content.

**Panel Layout**
- Header: the highlighted passage (truncated if long) for reference
- Conversation area: scrollable chat thread
- Input area: text field and submit button

**Interaction Modes**

*Open-ended entry (default):* The panel opens with an invitation such as "What would you like help understanding here?" — a deliberately low-pressure prompt that puts the user in control of the first move. Users can ask anything: "I don't understand what this is asking", "What does 40% mean here?", "Can you explain this to me like I'm ten?"

*Socratic mode (secondary button):* A "Help me think through this" button asks the AI to guide the user with a leading question rather than an explanation. This Socratic path is designed to build genuine understanding rather than provide answers. The AI asks one question at a time, waits for the user's response, and builds on it.

**AI Behavior and Tone**
The Claude API is instructed to behave as a patient, encouraging learning companion with the following non-negotiable behavioral constraints:
- Never give away full answers to math problems unless the user explicitly and directly asks for the answer
- Break every problem into the smallest possible comprehensible steps
- Acknowledge and normalize difficulty ("This kind of problem trips up a lot of people")
- Never express impatience, frustration, or condescension
- Adapt vocabulary and complexity to the user's demonstrated level throughout the conversation
- Celebrate incremental progress explicitly

**Context Persistence**
The Coach Panel maintains the full context of the highlighted passage throughout the conversation. The user does not need to re-paste or re-explain the original content. If the user navigates to a new detected region while a Coach Panel is open, the panel asks whether to continue the current conversation or start fresh.

---

### 4.3 Onboarding Flow

**First-Launch Welcome Sequence**

The onboarding flow runs once after installation and is designed to be completable in under three minutes with no prior technical knowledge required.

1. **Welcome screen:** Plain-language explanation of what DyslexAI does and does not do. No jargon. No wall of text.
2. **Mode selection:** Users choose which modes to enable — Lens Mode, Coach Mode, or both. Each option has a one-sentence plain-language description.
3. **Detection level (if Coach Mode is enabled):** Users choose Gentle, Balanced, or Thorough, with a concrete example of what each level would flag on a sample news article.
4. **Quick preference presets:** Three options to pre-configure settings based on primary need:
   - "I mainly struggle with reading" — enables Lens Mode with text-focused defaults; enables number detection but leaves Coach Mode off
   - "I mainly struggle with numbers" — enables Lens Mode with number highlighting; enables Coach Mode
   - "Both" — enables all features with balanced defaults
5. **Completion and demo:** A "You're ready!" confirmation screen with a button to open a sample page demonstrating the extension in action
6. **API key entry (settings, not onboarding):** Coach Mode API key entry is deferred to the settings panel so it does not block the onboarding flow for users who want to explore Lens Mode first

**Settings Panel**
- Organized under two tabs: Lens Mode and Coach Mode
- All settings persist using chrome.storage.sync, applying across devices signed into the same Chrome profile
- Website allow/block list: users can add domains to a blocklist (e.g., banking sites where the extension should not run) or switch to an allowlist model
- Full reset to defaults option with confirmation dialog

---

## 5. User Personas

### Persona 1: Maya — The Struggling Student

**Age:** 17
**Situation:** High school junior diagnosed with dyslexia at age 9. Strong verbal skills and creative intelligence, but reading-heavy assignments take her two to three times longer than her peers. She has learned coping strategies but still finds dense web pages exhausting, especially when doing research for papers.
**Relationship with technology:** Comfortable on her phone; uses Chrome on a school Chromebook. Not a power user. Has never installed a browser extension before.
**Pain points:**
- Online textbook chapters and Wikipedia articles are visually overwhelming
- She reads the same line multiple times because she loses her place
- Numbers in history or science articles confuse her when they appear in context ("World War I resulted in 17 million deaths" — she can read the words but the magnitude doesn't register)
- She feels embarrassed asking teachers to explain things she "should" already understand
**Goals:**
- Get through research assignments without hitting a wall of anxiety
- Understand quantitative claims in the articles she's reading
- Feel more confident, not just more functional
**How she uses DyslexAI:**
Maya sets OpenDyslexic font, a soft yellow overlay, and generous line height during onboarding. She uses the line focus feature during long reading sessions. When she clicks on "17 million" in a history article and sees the dot visualization broken into clusters of 100,000, it gives her a genuine sense of scale she has never had before. She rarely uses Coach Mode but has it set to Gentle so it occasionally flags historical comparisons she can tap into when curious.

---

### Persona 2: David — The Anxious Professional

**Age:** 34
**Situation:** Software engineer at a mid-sized company. Undiagnosed dyscalculia (he's never sought a formal diagnosis) but has struggled with numbers his whole life — including phone numbers, dates, and financial figures. His job does not require deep math, but he regularly encounters dashboards, performance metrics, budget figures, and percentage changes in reports. He masks his difficulty well but experiences significant anxiety around any meeting involving numbers.
**Relationship with technology:** Highly technical. Comfortable installing and configuring tools. Has used accessibility tools before for ergonomics but never for cognitive support.
**Pain points:**
- Financial reports and KPI dashboards make him anxious even when the numbers are simple
- He frequently misreads figures (transposing digits, losing track of scale)
- He is reluctant to ask colleagues to explain numbers he feels he "should" understand as a senior employee
- He wants support without having to disclose his difficulty to anyone
**Goals:**
- Parse financial and metric content on the web with confidence
- Have a private, judgment-free way to double-check his understanding of numbers
- Not feel like he's using a "special needs" tool at work
**How he uses DyslexAI:**
David uses Lens Mode primarily for number highlighting and the Number Insight Popup. He has set a subtle underline highlight so it doesn't look unusual if someone glances at his screen. He clicks number highlights to use the Audio View, which helps him confirm he's reading figures correctly. He uses Coach Mode at Balanced sensitivity and has had several Coach Panel conversations about financial percentage changes and metric calculations that he has never felt comfortable asking about in meetings.

---

### Persona 3: Priya — The Parent and Advocate

**Age:** 42
**Situation:** Elementary school teacher and mother of a 10-year-old son with dyslexia and ADHD. She is not dyslexic herself but is deeply invested in finding tools for her son and her students. She is also the person who will configure and explain the extension to others.
**Relationship with technology:** Moderate comfort. Uses Chrome daily for work. Can follow instructions but is not a developer.
**Pain points:**
- Existing dyslexia tools are fragmented — one app for reading, another for math, none that work across the whole web
- Tools designed for children are often patronizing or toy-like, which her son resents
- She needs something she can set up once and trust to work without daily maintenance
- She worries about her son encountering math content online with no support
**Goals:**
- Find a tool her son will actually use (i.e., not embarrassed by it)
- Configure it once with his preferences and have it just work
- Have visibility into whether it's helping without being intrusive
**How she uses DyslexAI:**
Priya installs DyslexAI on her son's Chromebook. She sets up Lens Mode with OpenDyslexic, a blue overlay (his preferred color), and number highlighting. She enables Coach Mode at Gentle sensitivity so it doesn't overwhelm him. She reviews the settings periodically but mostly leaves it alone. Her son uses the dot visualization independently and has started clicking on numbers in online articles without being prompted. He refers to it as "the dot thing."

---

### Persona 4: James — The Late-Diagnosed Adult Learner

**Age:** 51
**Situation:** Electrician returning to school for a contractor's license. Diagnosed with dyslexia two years ago after a lifetime of thinking he was "just not a reader." Now taking online coursework that includes significant math content — electrical calculations, code requirements, load assessments. He is highly experienced in his trade but struggles with the written and mathematical format of the coursework.
**Relationship with technology:** Limited. Uses a smartphone comfortably. Using a computer for coursework is relatively new. Has low tolerance for tools that feel complicated or condescending.
**Pain points:**
- The online coursework uses standard web interfaces with dense text and no accommodations
- Math word problems in the coursework feel like a different language even when he understands the underlying trade concept
- He feels shame about needing help at 51 and is hypervigilant about tools that feel like they're for children
- He has given up on pages and skipped material when numbers became overwhelming
**Goals:**
- Get through the math-heavy portions of his certification coursework
- Connect the abstract numbers in problems to the real-world electrical work he already understands intuitively
- Have a tool that treats him as an adult
**How he uses DyslexAI:**
James uses OpenDyslexic font and increased letter spacing in Lens Mode. He has Coach Mode set to Thorough because he wants support whenever numbers appear. He uses Coach Panel to ask questions like "What is this actually asking me to calculate?" and the AI regularly connects problems back to real-world scenarios he already knows. He has explicitly told the AI he's a tradesman, and the AI (with appropriate system prompting) uses electrical examples. The Socratic mode was initially frustrating for him but after a few sessions he has come to appreciate it.

---

## 6. User Journeys

### Journey 1: Installation Through First Real Use (Maya)

**Context:** Maya has just been assigned a chapter of her online history textbook to read before Friday. She remembered a classmate mentioning a Chrome extension.

**Step 1 — Discovery and Installation**
Maya searches "dyslexia chrome extension" and finds DyslexAI in the Chrome Web Store. She reads the description, sees the screenshots showing OpenDyslexic font and colored overlays, and clicks Install. The extension installs in seconds.

**Step 2 — Onboarding**
The welcome screen appears as a new tab. It says: "DyslexAI helps make the web easier to read and easier to understand. It won't change what websites look like for anyone but you." She selects "I mainly struggle with reading" from the presets. This configures OpenDyslexic font, word spacing at Comfortable, line height at Spacious, and a yellow overlay at 20% opacity. Number highlighting is turned on with a default blue underline. Coach Mode is left off.

She clicks "Show me how it works" and a sample news article opens. She immediately notices the font change and the wider spacing. She reads a sentence more easily than expected and clicks "Done."

**Step 3 — First Real Use**
She opens her history textbook chapter. The text has already reflowed into OpenDyslexic with her spacing settings. The line is noticeably easier to hold. She enables the line focus highlight from the extension popup and begins reading.

Partway through, she encounters the sentence: "The war resulted in the displacement of approximately 12 million people across Central Europe." The number "12 million" has a blue underline. She is curious and clicks it.

**Step 4 — Number Insight Popup**
The popup opens showing the Dot View. Twelve grouped clusters appear, each labeled "= 1 million." She can see the scale immediately in a way she never could from the digits alone. She taps the audio button and hears "twelve million." She taps it again. She closes the popup and keeps reading.

She finishes the chapter in 40 minutes, which is faster than usual. She does not feel exhausted.

**Step 5 — Daily Integration**
Over the next two weeks, Maya uses DyslexAI on every web-based reading assignment. She adjusts her overlay color once (to green, which she finds even better). She turns on Coach Mode at Gentle and uses it once, asking for help with a statistics sentence in a science article. She tells her mom about it.

---

### Journey 2: Encountering Math Anxiety in Real Time (David)

**Context:** David is preparing for a quarterly business review. He has been sent a link to an online report with financial performance data. He opens it and immediately feels his chest tighten.

**Step 1 — Page Load**
DyslexAI is already installed and configured. As the page loads, Lens Mode highlights numbers across the page — revenue figures, percentage changes, year-over-year comparisons. The highlights are a subtle underline in soft orange (his configured style). The visual organization already helps him distinguish numbers from text.

**Step 2 — Number Interaction**
He sees the phrase "revenue increased by 23% year over year, driven by a 14% increase in enterprise contracts." Both "23%" and "14%" are underlined. He clicks "23%."

**Step 3 — Number Insight Popup**
The Dot View shows 23 dots clustered in groups of 5. He switches to Audio View — "twenty-three percent" — and hears it confirmed. He closes the popup.

**Step 4 — Coach Mode Interaction**
Further down, a paragraph reads: "If Q3 trends hold, projected full-year EBITDA margin would be approximately 18%, compared to a sector average of 22%." The Coach Mode indicator appears at the left margin of this paragraph (he is using Balanced detection).

He clicks the indicator. The Coach Panel slides in from the right. The passage appears in the header. The panel says: "What would you like help understanding here?"

He types: "I understand what EBITDA is but I keep losing track of what a 4 percentage point gap actually means in this context."

The AI responds: "That's a really common source of confusion — percentage points and percentages trip up almost everyone. Let me ask you one thing first: do you know roughly what the company's total revenue is, or are we just working with ratios here?"

They exchange four messages. The AI explains the practical significance of a 4-point margin gap, uses a concrete dollar example based on the revenue figures on the page, and confirms David's understanding with a check question. David closes the panel, continues reading, and goes into the review meeting feeling prepared.

**Step 5 — Ongoing Habit**
David uses the Coach Panel two or three times a week. He has never told a colleague he uses it. He has started using it proactively rather than avoidantly — clicking indicators as a normal part of reading reports rather than only when he's confused.

---

### Journey 3: Certification Coursework (James)

**Context:** James is working through Unit 7 of his contractor certification coursework — load calculations for residential electrical panels.

**Step 1 — Encountering a Word Problem**
The page contains the following problem: "A residential service panel has a 200A main breaker. The calculated load for the home is 175 amps. A homeowner wants to add a hot tub requiring a dedicated 50A circuit. Determine whether the existing service can support the additional load and explain your reasoning."

Coach Mode (Thorough) immediately flags this passage. A subtle indicator appears at the left margin.

**Step 2 — Opening the Coach Panel**
James clicks the indicator. The panel opens. He clicks "Help me think through this" (Socratic mode).

The AI asks: "Before we look at the numbers — in your own words, what do you think the question is really asking? What's the main thing we need to figure out?"

James types: "Whether the panel can handle more amps without tripping or being a fire hazard."

AI: "Exactly right. So we've got a panel with a maximum capacity and a current load — and we want to add something new. Does the math feel straightforward from there, or is that where it gets fuzzy?"

James: "The math is where I lose it. I know in real life I'd just look at the panel and know but with numbers on a page I second-guess everything."

AI: "That makes complete sense — you're translating between two languages (the real thing and the written representation). Let's just do this one step at a time. What's the total if you add the existing 175A load to the new 50A circuit?"

They work through the problem over six exchanges. At no point does the AI give James the answer. At the end, James has arrived at the correct answer himself — 225A exceeds the 200A main breaker, requiring a service upgrade — and the AI confirms his reasoning is correct.

**Step 3 — Reinforcement**
James reads the AI summary of their conversation and realizes he can apply the same logic to other load calculation problems. He does the next three problems without opening the Coach Panel. He opens it on the fourth one to check his reasoning rather than to ask for help.

---

## 7. Design Principles

### 1. Meet Users Where They Are
DyslexAI must work on any website, in any context, without requiring users to copy content, navigate away, or change their browsing habits. If the tool creates friction between the user and the web, it has failed. Every feature should feel like it was always there.

### 2. Dignity First
Users of DyslexAI often carry histories of shame around reading and math. The product must never signal, imply, or reinforce that using it is embarrassing. This means: no toy-like aesthetics, no condescending copy, no "for kids" visual language. The tool should feel calm, professional, and capable — like a well-designed productivity tool, not a remediation app.

### 3. User Control Over Everything
No feature should be forced on users. Font changes, overlays, highlights, and AI suggestions should all be opt-in, configurable, and instantly reversible. Users know their own needs better than we do. DyslexAI provides tools, not prescriptions.

### 4. Non-Intrusiveness as a Feature
The extension is present without being obtrusive. Visual indicators should be subtle enough to not distract users who are in a flow state. The Coach Panel should slide in without covering content. Popups should appear without triggering layout shifts. Silence is acceptable; interruption is not.

### 5. Scaffolding Over Answers
Especially in Coach Mode, the product's job is to build capability, not dependency. The AI should leave users more capable than when they started — not just having received an answer but having understood a concept. Every coaching interaction is a chance to reduce the user's need for coaching in the future.

### 6. Emotional Safety as Infrastructure
For many users, encountering a difficult math problem or a dense wall of text is not just cognitively challenging — it is emotionally threatening. The AI's tone, the visual design, the absence of any time pressure or error state, and the framing of the onboarding all contribute to emotional safety. This is not a "nice to have." It is load-bearing.

### 7. Incrementalism and Progress
Features, settings, and interactions should offer progressive disclosure. A user does not need to configure everything on day one. A student does not need to understand the whole math concept in one session. The product should reward small steps and make incremental progress feel meaningful.

### 8. Privacy as a Default
DyslexAI processes page content locally wherever possible. The Claude API is only called when the user actively initiates a Coach Mode conversation. No browsing data, page content, or usage patterns are sent to any server other than the Anthropic API during active tutoring sessions. The API key is stored locally in chrome.storage.sync and never transmitted to DyslexAI's infrastructure.

---

## 8. Success Metrics

### 8.1 Adoption Metrics

| Metric | Description | Target (90 days post-launch) |
|---|---|---|
| Weekly Active Users | Users who open a page with DyslexAI active at least once in the week | 2,000 WAU |
| Onboarding Completion Rate | % of installs that complete the welcome flow | > 70% |
| Day-7 Retention | % of installers still active 7 days later | > 40% |
| Day-30 Retention | % of installers still active 30 days later | > 25% |

### 8.2 Lens Mode Engagement

| Metric | Description |
|---|---|
| Settings Customization Rate | % of users who adjust at least one default setting beyond preset |
| Font Switch Rate | % of Lens Mode users who switch to OpenDyslexic |
| Number Highlight Interaction Rate | % of sessions where a user clicks at least one number highlight |
| Dot View Usage | % of Number Insight Popup opens that include a Dot View view |
| Audio View Usage | % of Number Insight Popup opens that trigger audio playback |

### 8.3 Coach Mode Engagement

| Metric | Description |
|---|---|
| Coach Mode Activation Rate | % of users who enable Coach Mode |
| Coach Panel Opens per Session | Average number of Coach Panel opens per active Coach Mode session |
| Conversation Depth | Average number of exchanges per Coach Panel conversation (proxy for engagement quality) |
| Socratic vs. Open-ended | Split between Socratic mode and open-ended entry |
| API Key Entry Rate | % of Coach Mode activations that result in successful API key entry |

### 8.4 Qualitative and Outcome Metrics

| Metric | Method |
|---|---|
| User-reported confidence | In-extension survey after 30 days of active use: "Do you feel more confident reading/understanding numbers on the web?" |
| Task completion self-report | Optional prompt after Coach Panel close: "Did this help you understand?" (thumbs up/down) |
| Unsolicited feedback sentiment | App store reviews, support emails, social mentions |
| Persona validation | Structured user interviews with 3–5 participants per persona at 60 days post-launch |

### 8.5 Guardrail Metrics

These metrics indicate problems requiring immediate attention:

- Chrome Web Store rating drops below 4.0
- Onboarding completion rate drops below 50%
- Day-7 retention drops below 30%
- More than 15% of Coach Panel sessions end with user explicitly asking for the answer without prior Socratic engagement (possible signal that scaffolding is too slow or frustrating)

---

## 9. Out of Scope (v1)

The following features have been considered and deliberately deferred to preserve v1 scope and quality. They are not rejected — they are scheduled.

### Platform and Browser Support
- Firefox, Safari, Edge extensions — v1 is Chrome-only (Manifest V3)
- Mobile browser extensions — deferred pending platform support

### Authentication and Accounts
- No user accounts or login in v1
- No cloud sync of settings beyond chrome.storage.sync (which syncs across Chrome profiles)
- No usage history or conversation history stored beyond the current session

### AI Features
- No AI-generated accessibility summaries of full pages
- No automatic reading-level adjustment of page text (rewriting content)
- No image or chart accessibility (alt text generation, chart description) — numbers in images are not detected
- No PDF support — v1 works on HTML web pages only; PDF.js integration is deferred
- No offline AI mode — Coach Mode requires an active internet connection and a valid API key
- No built-in API key provision — users must supply their own Claude API key in v1; a managed key option (with associated billing) is deferred to v2

### Lens Mode
- No per-site font memory beyond the global allow/block list (i.e., no "use Arial on this site, OpenDyslexic everywhere else" in v1)
- No custom OpenDyslexic font variants (bold, italic weights are in scope; variable font weight slider is deferred)
- Number detection does not cover numbers inside SVGs, Canvas elements, or images

### Coach Mode
- No proactive, unprompted AI suggestions (AI only responds when user initiates)
- No integration with specific educational platforms (Google Classroom, Canvas, Khan Academy)
- No parent or teacher dashboard
- No multi-language support — v1 is English only

### Accessibility
- Screen reader compatibility (ARIA) for the extension's own UI — important but deferred to a dedicated accessibility sprint
- Keyboard-only navigation for all extension panels — partially in scope; full coverage is a post-v1 hardening item

---

## 10. Open Questions

These questions are unresolved as of the time of this document and must be answered before or during engineering. Each is flagged with the relevant team and priority.

### Product and UX

**Q1: What is the right default state for number detection?**
Should number detection be on by default for all new users, or should users opt into it during onboarding? Turning it on by default maximizes discoverability but may feel jarring on pages that are not math-related. Opt-in reduces discovery. Consider: split test in onboarding.

**Q2: Should the Number Insight Popup include a "what does this mean?" button that triggers a Coach Mode explanation?**
This would create a natural bridge between Lens Mode and Coach Mode and could surface Coach Mode to users who only enabled Lens Mode. Risk: it may blur the mental model between the two modes. Needs UX review.

**Q3: How should the line focus highlight interact with the colored overlay?**
Both features affect the visual treatment of the page simultaneously. Is the combination always additive? Can users configure them to interact in specific ways? Need to prototype this.

**Q4: What is the right onboarding moment to introduce the API key?**
Deferring it entirely to settings means Coach Mode is unavailable until the user proactively configures it. Should there be a passive prompt after the user's first Coach Panel click ("Add your API key to start using this feature")? What is the conversion rate implication?

**Q5: How do we handle the Dot View for very large numbers (millions, billions)?**
The proposed solution (clusters with scale labels) needs UX validation. Is a visual representation of 12 million actually helpful, or does it become an abstraction that defeats the purpose? Needs user testing with dyscalculia users specifically.

### Engineering and Technical

**Q6: What is the right approach for word problem detection — pure pattern matching, a lightweight local model, or a Claude API call?**
Pattern matching is fast, private, and free but will produce false positives and miss nuanced cases. A Claude API call is accurate but introduces latency on every page load and uses API credits even when the user may not want coaching. A lightweight local model is an option but adds bundle size and complexity. Decision needed before architecture begins.

**Q7: How do we handle dynamically loaded content (SPAs, infinite scroll)?**
Lens Mode and Coach Mode both require scanning page text. Pages built with React, Next.js, or similar frameworks may load content asynchronously after the initial DOM is ready. A MutationObserver approach is likely correct but needs scoping — how aggressive should re-scanning be, and what are the performance implications?

**Q8: What is the performance budget for Lens Mode on large, content-heavy pages?**
Injecting CSS overrides and scanning all text nodes for numbers on a page like Wikipedia or a long news article could be expensive. What is the acceptable time-to-interaction after page load? Is a progressive scan (visible viewport first, then background) needed?

**Q9: How should the extension handle pages that already have strong accessibility implementations (WCAG AA or better)?**
Should Lens Mode detect existing accessibility features and offer to complement rather than override them? Or is blanket override acceptable given that users have explicitly chosen their preferences?

**Q10: What is the Claude API prompt architecture for Coach Mode?**
Specifically: how do we structure the system prompt to enforce tone, Socratic behavior, and non-answer-giving in a way that is robust to adversarial user inputs ("just tell me the answer")? What happens when a user explicitly asks for the answer — does the AI comply? This is both a product decision and a prompt engineering task.

### Business and Legal

**Q11: Are there any legal or compliance considerations for processing web page content through the Claude API?**
The Coach Mode conversation includes content from the page the user is reading. Some pages may contain personally identifiable information, proprietary content, or content under restrictive terms of service. What disclosure obligations does DyslexAI have to users, and what are the implications for the privacy policy?

**Q12: What is the plan for API key security education?**
Users storing their own Claude API key in chrome.storage.sync need to understand the implications (exposure risk, cost liability). What is the right in-product education for this, and where does it live?

**Q13: What is the monetization path for v2+?**
v1 is free with a user-provided API key. What does v2 look like — a managed key subscription? A freemium model with Lens Mode free and Coach Mode paid? This decision affects product positioning and what we build into v1's infrastructure.

---

*This document is a living artifact. It should be updated as open questions are resolved, personas are validated through user research, and the product evolves. All section owners are responsible for flagging when their section becomes materially out of date.*

---

**Document Owner:** Product — DyslexAI
**Last Updated:** March 29, 2026
**Next Review:** April 30, 2026
