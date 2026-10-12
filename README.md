# ChapterLens 📖

> **Understand your writing. Keep your voice.**  
> A production-grade editorial readability studio built for novelists, essayists, students, and independent authors.

---

## 🌟 Overview

ChapterLens is an editorial readability tool designed specifically for writers. Unlike generic AI analyzers or arbitrary gamified scoring dashboards, ChapterLens operates with a clear philosophy:

1. **Deterministic Linguistic Engine**: Real mathematical scoring based on Rudolf Flesch’s Reading Ease index (1948).
2. **Multi-Signal Difficulty Ranking**: Isolates the 5 hardest sentences using a calibrated composite heuristic (word cadence, syllable weight, polysyllabic density, and structural punctuation breaks) rather than naively flagging long sentences.
3. **Offset-Preserved Highlighting**: 100% character-faithful inline manuscript rendering with non-destructive slicing that avoids regex string collisions (even on repeated identical sentences).
4. **Privacy by Design**: Primary chapter analysis runs 100% client-side in browser memory. No server uploads, no cookies, no tracking scripts, and no database retention.
5. **No Sign-Up or Mandatory AI**: Fully functional without accounts, subscriptions, or external LLM APIs. Optional AI assistance is strictly opt-in and handled via secure server-side routes.

---

## 🎨 Visual Identity & UX Direction

ChapterLens rejects the generic purple-gradient AI SaaS look in favor of a warm, distinguished editorial writing atelier:
- **Canvas**: Warm ivory and paper-white (`#FBFBF9`, `#FFFFFF`)
- **Brand Identity**: Deep forest green (`#1A3C2D`, `#122B20`)
- **Typography**: Editorial serif (`Lora` / `Georgia`) paired with clean interface typography (`Plus Jakarta Sans`)
- **Friction Highlights**: Muted amber, terracotta, and soft sage with numbered markers (`[1]`–`[5]`) for full non-color accessibility (WCAG 2.2 AA compliant).
- **Responsive Studio**: Side-by-side manuscript review on desktop and unified vertical reading flow on tablet/mobile.

---

## 📐 Mathematical & Linguistic Methodology

### 1. The Flesch Reading Ease Formula

$$\text{Score} = 206.835 - 1.015 \left(\frac{\text{Total Words}}{\text{Total Sentences}}\right) - 84.6 \left(\frac{\text{Total Syllables}}{\text{Total Words}}\right)$$

- **Clamped Range**: Displayed from 0 to 100 (raw unclamped score available in inspector tooltip).
- **Score Bands**:
  - `90–100`: Very Easy (5th grade level, fluid & effortless)
  - `80–89`: Easy (6th grade level, conversational commercial prose)
  - `70–79`: Fairly Easy (7th grade level, mainstream fiction)
  - `60–69`: Standard (8th–9th grade level, balanced literary & journalistic prose)
  - `50–59`: Fairly Difficult (10th–12th grade level, high cognitive load)
  - `30–49`: Difficult (College undergraduate, baroque or academic clauses)
  - `0–29`: Very Difficult (Graduate / specialized academic prose)

### 2. Multi-Signal Sentence Difficulty Heuristic

To identify the hardest sentences, ChapterLens calculates normalized features for each sentence candidate:

| Signal | Weight | Linguistic Dimension |
| :--- | :---: | :--- |
| **Sentence Length** | 35% | Words per sentence (cognitive working memory limit) |
| **Syllable Density** | 25% | Average syllables per word (phonological processing effort) |
| **Polysyllabic Ratio** | 25% | Proportion of words with $\ge 3$ syllables |
| **Structural Complexity** | 15% | Semicolons, em dashes, parentheticals, colons, and comma cadence |

**Deterministic Tie-Breaking**:
If two sentences receive identical composite scores, ties are resolved deterministically:
1. Higher polysyllabic word count
2. Higher raw word count
3. Earlier appearance (`startIndex`) in the original text

### 3. Sentence Segmentation & Syllable Estimation

- **Segmentation**: Handles abbreviations (`Dr.`, `Mr.`, `e.g.`, `i.e.`), decimal numbers (`3.14`), ellipses (`...`), and quoted dialogue attribution (`"Wait!" she whispered.`) without false sentence breaks.
- **Syllable Estimation**: Combines an extensive irregular dictionary with morphological rules (silent `e`, syllabic consonants like `-ism`/`-sm`, pronounced vs. silent `-ed`, consonant-le endings, and hiatus vowel pairs).

---

## ⚠️ Known Linguistic Limitations

- **Idiomatic Variance**: Like all statistical formulas, Flesch Reading Ease measures surface structural friction, not deep narrative comprehension, irony, or conceptual subtlety.
- **Literary Context**: Hemingway sentences routinely score 85+, while Faulkner and Woolf score 30–45. A low score indicates high surface complexity, not poor writing quality.
- **Statistical Reliability**: Formulated for continuous prose passages of 100+ words. Passages under 30 words or fewer than 3 sentences display a short-sample warning.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, CSS Variables, Editorial Tokens
- **Icons**: Lucide React
- **Testing**: Vitest 3, JSDOM
- **Deployment Target**: Vercel

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### 1. Installation
```bash
git clone <repository-url>
cd Chapter_Lens
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Unit & Edge-Case Test Suite
```bash
npm run test
```

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🔑 Environment Variables (Optional)

The application requires **zero environment variables** for all core analysis, sentence ranking, and highlighting features.

If you wish to enable optional server-side AI-assisted sentence revision:
```env
# Optional: Google Gemini API key for /api/rewrite
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenAI API key (alternative provider)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Anthropic API key (alternative provider)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

When no API key is provided, ChapterLens generates useful deterministic editing guidance and rule-based suggested rewrites 100% offline in your browser, clearly labeled as editorial tips rather than AI rewrites.

---

## 🧪 Testing Verification

ChapterLens includes 60 automated tests across 8 test suites:
- `flesch.test.ts`: Formula accuracy, mathematical clamping, reading time estimation
- `syllables.test.ts`: Phonetic rules, silent letters, diphthongs, syllabic consonants (`-sm`), compound hyphenated words
- `segmenter.test.ts`: Abbreviations, initials, decimal numbers, dialogue quotes, paragraph index preservation, em-dash clauses
- `difficulty.test.ts`: Multi-signal scoring, feature normalization, deterministic tie-breaking, rule-based rewrites and editorial tips
- `highlighter.test.ts`: Non-destructive character reconstruction, repeated identical sentences
- `analyzer.test.ts`: Whole-chapter orchestrator, statistical reliability bounds
- `edge_cases.test.ts`: 18 linguistic edge cases (empty input, fragments, large chapters, Unicode)
- `api_rewrite.test.ts`: Server-side privacy boundaries, multi-provider validation, character limits, error handling

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub or GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. The default settings (`Framework: Next.js`, `Build Command: npm run build`, `Output Directory: .next`) will be detected automatically.
4. (Optional) Add `GEMINI_API_KEY` under Project Settings > Environment Variables if you want optional AI rewriting.
5. Click **Deploy**.

---

## 📄 License & Attribution

Designed and engineered for writers everywhere. Open, private, and deterministic.
