# ChapterLens 📖

> **Understand complex research. Audit prose cadence. Keep your voice.**  
> A production-grade editorial clarity studio and guided research-reading environment for scholars, essayists, students, and authors.

---

## 🌟 Overview & Core Application Modes

ChapterLens operates with a strict philosophy: deterministic local computation, transparent source-grounded comprehension, and absolute privacy. It provides two distinct, seamlessly integrated modes:

### 1. 📊 Readability & Cadence Audit
- **Deterministic Linguistic Scoring**: Rudolf Flesch Reading Ease index (1948) balancing sentence cadence against syllable weight.
- **Multi-Signal Friction Ranking**: Isolates the top difficult sentences using a calibrated composite heuristic (sentence length, syllable density, polysyllabic ratio, and structural clause fragmentation) rather than naively penalizing long sentences.
- **Character-Faithful Highlighting**: 100% non-destructive inline manuscript highlighting preserving exact character offsets and whitespace without string-replacement collisions.
- **Source Location Integration**: Maps every difficult sentence directly back to its original page number and section heading in imported documents.

### 2. 📖 Guided Research Reading
- **Academic Reading Workspace**: Clean reading pane with preserved section hierarchy, comfortable line lengths, and page boundary markers.
- **Collapsible Document Navigator**: Interactive outline displaying section headings (`H1`, `H2`, `H3`) and page numbers for multi-page documents.
- **Passage-Level Explanations**: Select any sentence or technical term and switch dynamically between three comprehension levels:
  - **`🌱 Beginner`**: Core ideas explained in clear, everyday language with intuitive analogies and definitions of unfamiliar terms.
  - **`🪜 Step by Step`**: Logical decomposition breaking passages into premises, mechanisms, and conclusions.
  - **`🔬 Technical`**: Rigorous formulation using formal terminology, underlying assumptions, and methodological context.
- **Prerequisite Concepts**: Automatically isolates up to 3 foundational concepts required to grasp the selected passage, with an **Explore** action for deep diving.
- **Source Grounding & Limitations**: Every explanation cites the supporting verbatim passage, page number, section heading, and immediate context fit. Explicitly flags when extracted text omits formulas, diagrams, or tables instead of guessing.
- **Lightweight Comprehension Check**: Single, focused question testing core understanding with an on-demand **Reveal Answer & Explanation** reveal.

### 3. 🧪 First-Time User Experience & Sample Research Paper
- **Instant Interactive Exploration**: First-time visitors can explore ChapterLens immediately with a single click using the built-in, illustrative research sample paper (*"Sample Study: Attention & Cognitive Load"*).
- **Authentic Pipeline Execution**: The sample paper is not simulated or pre-baked; it executes through the full mathematical analysis pipeline, computing authentic Flesch scores, syllable counts, sentence friction candidates, and document block indices live.
- **Unambiguous Labeling**: Clear badges (`🧪 Sample Document`) and alert banners distinguish sample content from user manuscripts.
- **Seamless Document Replacement**: One-click actions allow users to switch from the sample to their own `.pdf`, `.docx`, or `.txt` files or pasted text at any time.

---

## 👥 Target Users

- **Researchers & Academics**: Quickly audit chapter drafts, research grant proposals, and review literature without abandoning complex original documents.
- **Students & Lifelong Learners**: Understand dense, jargon-heavy papers across Beginner, Step-by-Step, and Technical levels with prerequisite concept maps.
- **Authors & Essayists**: Identify syntactic friction, run-on sentences, and phonetic weight while preserving personal voice and literary style.

---

## 🔒 Privacy & Security Guarantees

ChapterLens is engineered with privacy as a foundational requirement:

1. **100% In-Browser Document Parsing**: PDFs (`pdfjs-dist`), Word documents (`mammoth`), plain text files, and pasted manuscripts are parsed entirely locally in your browser. Document files and raw manuscripts are **never uploaded to any server**.
2. **Explicit User Consent Gate**: Before any AI explanation request is made, a transparent disclosure modal displays exactly what data will be transmitted and why. Transmission only occurs upon explicit user confirmation (`chapterlens-ai-consent` in session storage).
3. **Strict Minimum Context Transmission**: The application **never transmits the full document**. Outbound requests send only the selected passage and its immediate surrounding paragraph, strictly capped at **1,200 characters**.
4. **Server-Side API Key Isolation**: All provider credentials (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) remain strictly server-side in Next.js API routes (`/api/explain`, `/api/rewrite`). No keys are exposed to client-side bundles.
5. **Private Offline Fallback**: If no AI provider is configured in the environment, ChapterLens operates 100% offline. Document importation, outline navigation, reading, and readability analysis remain fully operational.

---

## 🔑 Environment Variables & AI Provider Setup

ChapterLens requires **zero environment variables** for all document reading, extraction, outline navigation, and readability scoring.

To enable optional multi-level guided explanations and simplified sentence suggestions, set **one** of the following environment variables in your deployment (`.env.local` or hosting provider):

```env
# Option 1: Google Gemini (recommended default)
GEMINI_API_KEY=your_gemini_api_key_here

# Option 2: OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Option 3: Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Rate Limiting & Deployment Architecture Note
- **Rate-Limiting Protection**: Outbound explanation requests are cached in client-side session memory to eliminate duplicate requests for identical passages and levels. Upstream provider quota limits are safely caught and relayed to clients as HTTP 429 responses.
- **Multi-Instance Limitation**: The application does not include a distributed Redis-backed rate limiter across serverless instances in this milestone; quota protection relies on upstream provider token limits and client session caching.

---

## ⚠️ Known Limitations & Scope Boundaries

- **Supported Document Formats**: `.pdf` (text-based), `.docx` (Microsoft Word), `.txt` (plain text), and direct pasted text.
- **Scanned Image-Only PDFs (OCR)**: ChapterLens extracts digitally embedded text layers. Scanned PDFs containing only bitmap images will trigger an `EMPTY_PAGES` warning indicating that OCR extraction is not included in this milestone.
- **Formulas and Complex Diagrams**: Raw text extraction cannot reliably interpret visual diagrams, charts, or complex multi-line LaTeX equations. When passages reference missing equations or figures, ChapterLens explicitly states this in `limitationsNotice` rather than fabricating scientific claims.
- **Independent Scientific Validation**: Guided reading explanations are intended for comprehension assistance, not peer-review validation of research conclusions.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5 (App Router, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, CSS Variables, Editorial Design Tokens
- **Icons**: Lucide React
- **Document Extractors**: `pdfjs-dist` (in-browser PDF extraction), `mammoth` (DOCX extraction)
- **Testing**: Vitest 3, JSDOM
- **Deployment Target**: Vercel

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### 1. Installation
```bash
git clone https://github.com/CH-JASWANTH-KUMAR/chapterlens.git
cd chapterlens
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Quality & Test Commands
```bash
# Run all 116 automated tests across 12 test files
npm test

# Run TypeScript static analysis and type validation
npm run lint

# Run optimized production build
npm run build
```

---

## 🧪 Automated Test Verification

ChapterLens includes **116 automated tests across 12 test suites**:
- `sample_document.test.ts` (6 tests): Illustrative sample document generation, ExtractedDocument conformance, character offset slice fidelity, real Flesch scoring integration without mocked data, bounded passage extraction, and user document replacement.
- `reading_guided.test.ts` (29 tests): Context extraction (≤1200 chars), source location preservation, multi-level explanations, prerequisite concept bounding, Gemini/OpenAI/Anthropic provider adapters, sanitized error reporting, user consent gate, payload constraints, and boundary edge cases.
- `document_extractors.test.ts` (13 tests): PDF, DOCX, TXT local extraction, multi-page page indexing, heading detection, and corrupted file handling.
- `document_integration.test.ts` (8 tests): End-to-end document-to-analysis pipeline, locator offset mapping, and page-enriched candidate ranking.
- `api_rewrite.test.ts` (7 tests): Multi-provider rewrite handling, character limits, privacy boundaries, and offline fallbacks.
- `flesch.test.ts` (5 tests): Rudolf Flesch formula mathematical accuracy and score band clamping.
- `syllables.test.ts` (8 tests): Phonetic rules, silent letters, diphthongs, and syllabic consonants.
- `segmenter.test.ts` (10 tests): Abbreviations, decimals, dialogue quotes, and em-dash clauses.
- `difficulty.test.ts` (6 tests): Composite heuristic scoring, normalized weights, and deterministic tie-breaking.
- `highlighter.test.ts` (3 tests): Non-destructive character reconstruction and repeated identical sentence handling.
- `analyzer.test.ts` (3 tests): Whole-chapter orchestration and statistical reliability bounds.
- `edge_cases.test.ts` (18 tests): Extreme character counts, whitespace variations, and Unicode manuscripts.

---

## 📄 License & Attribution

Designed and engineered for researchers, writers, and students everywhere. Open, private, and deterministic.
