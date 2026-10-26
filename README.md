# The Last Commit — An Open-Weight AI Code Archaeologist

> **“Every codebase leaves a trace. Some refuse to disappear.”**
>
> *Built for the Hacktoberfest Open-Source AI Challenge, Week 4: “Ghost in the Machine”.*

---

## 1. Overview

**The Last Commit** is an atmospheric, cinematic horror-themed code archaeology tool powered by Google’s open-weight **Gemma 4** model (`gemma-4-26b-a4b-it`). It helps software engineers comprehend legacy snippets, investigate dormant bugs, and modernize brittle routines—all presented through a haunted CRT terminal interface that pairs creative storytelling with rigorous static analysis.

### Core Capabilities:
- **Séance Mode**: Channels the fictional spirit of the legacy snippet to narrate what it used to do, coupled with an authoritative architectural breakdown, assumed invariants, and missing environmental context.
- **Autopsy Mode**: Systematically examines code for deprecated APIs, security vulnerabilities (e.g. SQL injection, unsafe eval, unescaped DOM sinks), error-handling gaps, and race conditions without hallucinating line numbers.
- **Resurrection Mode**: Reconstructs snippets into modern, idiomatic, type-safe code (ES2024, PHP 8+, Python 3.12+, etc.) accompanied by architectural explanations, compatibility caveats, and concrete test cases to run before deployment.
- **The Forgotten System (Playable Matrix Terminal)**: An interactive HTML Canvas 2D engine with physical ripple mechanics, character dispersal physics, spectral signals, and a code graveyard of ancient recovered artifacts.
- **Archival Vault**: Persists analysis sessions into browser `localStorage`, allowing developers to search, inspect, copy reports, and download clean Markdown artifacts.

---

## 2. Playable Matrix Terminal ("The Forgotten System")

Accessible at `/terminal`, the application features a custom, high-refresh-rate Canvas 2D terminal engine:

### Modes:
1. **Matrix Rain**: Classic falling-character ambience with multi-layered depth, speed variation, and head-character brightness. Moving or clicking the pointer creates localized energy ripples and character displacement.
2. **Ghost Signal**: Intercepts atmospheric system transmissions and fictional lore pulses with spectral cyan interference.
3. **Code Graveyard**: Explore ancient salvaged code fragments from decommissioned legacy systems (1981 FORTRAN, 1994 C Use-After-Free, 1999 Perl CGI, 2002 Bash recurser, 2005 SQL tautology). Click any fragment to inspect its lore, copy its text, or send it directly to the AI workspace for a full archaeological séance.

### High-Refresh-Rate Performance:
- Time-based delta updates via `requestAnimationFrame` ensuring motion consistency across 60Hz, 120Hz, and 144Hz displays.
- Configurable FPS cap limiter: **Auto (Native Display Sync)**, **30 FPS**, **60 FPS**, **120 FPS**, and **144 FPS**.
- Automated throttling when browser tabs are hidden (`document.hidden`).
- High-DPI device-pixel-ratio auto-scaling without creating single DOM elements per character.

### Procedural Retro Audio:
- Native Web Audio API ambient room tone generator mimicking a 55Hz CRT monitor hum and slow analog tape drift.
- **OFF by default**; requires explicit user toggle with real-time volume calibration. Zero external audio dependencies.

---

## 3. Open-Weight AI Architecture

### Model Configuration
- **Model Identifier**: `gemma-4-26b-a4b-it` (Google Gemma 4 instruction-tuned checkpoint)
- **SDK**: Official `@google/genai` TypeScript SDK (`^2.4.0`)
- **Transport**: Server-side proxy via Express (`/api/analyze-code`) protecting API credentials from browser leakage.
- **Configuration**:
  - `GEMINI_API_KEY`: Injected securely via environment secrets.
  - `GEMMA_MODEL_NAME`: Server-side model name setting (defaults to `gemma-4-26b-a4b-it`).

### Why Open Weights Matter
Unlike closed proprietary APIs, open weights give developers:
1. **Inspectability**: Ability to inspect tokenizer rules, attention heads, training data provenance, and published weights.
2. **Local Self-Hosting Pathway**: Teams can run Gemma on local GPUs or CPU engines using Ollama, llama.cpp, or vLLM in air-gapped secure environments.
3. **No Lock-in**: Zero exposure to arbitrary commercial API deprecations or sudden fee changes.

---

## 4. Technology Stack & Cinematic Aesthetic

- **Palette**: Void Black (`#07090D`), Charcoal Panel (`#0D1118`), Elevated Surface (`#141A24`), Matrix Green (`#29F06B`), Phosphor Green (`#8DFF9B`), Ghostly Cyan (`#70E8F2`), Spectral Violet (`#A78BFA`), Distressed Amber (`#F0B76D`), Critical Warning (`#F06F73`).
- **Frontend**: React 19, TypeScript, React Router 7, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, `tsx`, `@google/genai` SDK.
- **Storage**: Client-side `localStorage` with schema validation and error isolation.
- **Build System**: Vite 8 with full SPA client routing and Cloud Run production readiness.

---

## 5. Privacy & Zero-Execution Policy

1. **Zero Code Execution**: The Last Commit **never executes, compiles, evals, or runs** user-submitted code snippets. All analysis is 100% static semantic text inspection.
2. **Data Transparency**: Code snippets submitted in this hosted version are sent to the model provider (Google Gemini API) to perform inference. Do not submit production credentials, private keys, or confidential secrets.
3. **Local Storage Only**: Saved reports remain entirely on your local browser/device. There is no remote user tracking database.

---

## 6. Getting Started & Installation

### Prerequisites
- Node.js 20+
- A Google Gemini API key (providing access to Gemma 4)

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/the-last-commit.git
cd the-last-commit

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY
```

### Development
```bash
npm run dev
# The full-stack app will launch at http://localhost:3000
```

### Automated Testing
```bash
npm test
# Runs the 10-test validation, schema parsing, and terminal integrity suite
```

### Production Build & Deployment
```bash
npm run build
npm start
# Listens on process.env.PORT or 3000, bound to 0.0.0.0 for Google Cloud Run
```

---

## 7. License

Distributed under the Apache 2.0 License.
