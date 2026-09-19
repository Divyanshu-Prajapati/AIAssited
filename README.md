# 🚀 DSA AI Assessment Lab

A production-quality, local-first AI-assisted Data Structures & Algorithms (DSA) coding assessment simulator. Designed specifically for practicing technical coding assessments similar to modern HackerRank and Capgemini AI-assisted interview environments.

> **100% Free & Local Operation**: Built to run completely offline without requiring paid OpenAI, Anthropic, or Gemini API keys. Powered by local Java JDK 24 process sandboxing, SQLite database, and Guarded AI rule-based static analysis with optional Ollama LLM integration.

---

## 🌟 Key Features

- **Story-Based DSA Questions**: 118 comprehensive, realistic story-based coding challenges spanning all 19 standard DSA topics (Warehouse shipment adjustments, Bank transactions, Railway dispatch scheduling, Traffic monitoring, E-commerce flash sales, etc.).
- **Guarded AI State-Machine Workflow**: Enforces a strict candidate evaluation state sequence:
  1. **STEP 1 — UNDERSTANDING**: Explaining problem input/output contracts, constraints, and edge cases.
  2. **STEP 2 — PLAN & DATA STRUCTURE**: Proposing brute-force vs optimized approaches, data structure selection, and $O(N)$ time/space complexity analysis.
  3. **STEP 3 — IMPLEMENTATION**: Writing clean Java solutions inside the Monaco Editor.
  4. **STEP 4 — RUN & DEBUG**: Executing visible test cases with real compiler & runtime logs.
  5. **STEP 5 — SUBMISSION**: Running hidden test suites & generating out-of-10 score verification reports.
- **Real Java Code Execution Engine**: Sandboxed Java execution using system JDK 24 process isolation with configurable timeouts (e.g. 2000ms), memory caps (256MB), output size limits, and fallback adapters for self-hosted Judge0 CE containers.
- **Monaco Editor Integration**: Full VS Code dark-themed editor with Java syntax highlighting, auto-indentation, keyboard shortcuts (`Ctrl+Enter` to Run, `Ctrl+Shift+Enter` to Submit), and code version history restoration.
- **Progressive Hint Escalation**: 6-level structured hints ranging from Level 1 (Pattern identification) to Level 6 (Algorithm pseudocode guidance).
- **Adaptive Difficulty Engine**: Dynamic candidate skill profile tracking topic strengths, accuracy rates, average solving time, and automatic next-question selection.
- **Rich Dashboard & Analytics**: Visual topic mastery breakdown (Recharts), attempt history logs, and 7 distinct practice modes (Guided Practice, Timed Assessment, Weak Area Practice, Topic Practice, Mock Assessment).

---

## 🏗️ Architecture Overview

```
                 ┌──────────────────────────────────────┐
                 │       React 18 + Vite Frontend       │
                 │   Monaco Editor, Zustand, Recharts   │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼ REST APIs (Port 5001)
                 ┌──────────────────────────────────────┐
                 │        Express + TypeScript API      │
                 │        Assessment State Machine      │
                 └──────────────────┬───────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
  Prisma ORM + SQLite       AIService Facade         ExecutionService Facade
  (118 Seeded Questions)            │                         │
                                    ├──> LocalOllamaProvider  ├──> LocalJavaExecutionAdapter (JDK 24)
                                    └──> RuleBasedProvider    └──> Judge0Adapter (Docker)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **State Management**: Zustand
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v7

### Backend
- **Server**: Node.js, Express, TypeScript
- **Database**: SQLite via Prisma ORM
- **Validation**: Zod
- **Code Sandbox**: `LocalJavaExecutionAdapter` (JDK 24 child_process isolation) & `Judge0Adapter`
- **AI Engine**: `LocalOllamaProvider` (Ollama LLM) & `RuleBasedAIProvider` (Offline Guarded AI)

---

## 🚦 Quick Start Guide

### 1. System Requirements Check
- **Node.js**: v18 or higher (Detected: `v23.11.0`)
- **npm**: v9 or higher (Detected: `10.9.2`)
- **Java JDK**: JDK 17 or higher (Detected: `JDK 24`)

### 2. Environment Setup & Seeding

```bash
# Clone or navigate to project directory
cd "AI-Assisted Coding"

# Install backend & frontend dependencies
npm run install:all

# Synchronize SQLite database & seed 118 story-based questions
npm run db:push
```

### 3. Run Development Servers

Run the backend server (Port 5001) and frontend Vite app (Port 5173):

```bash
# Terminal 1: Start Express API Server
npm run dev:server

# Terminal 2: Start React Client App
npm run dev:client
```

Open your browser at **`http://localhost:5173`** to access the application!

---

## ⚙️ Optional Integrations (Docker & Ollama)

### 1. Local LLM via Ollama (Optional)
If you want LLM-powered natural language prompt feedback:
```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# Pull recommended coding model
ollama pull qwen2.5-coder:7b
```
*Note: If Ollama is not installed or running, the platform automatically switches to the built-in `RuleBasedAIProvider` without breaking.*

### 2. Judge0 CE Sandbox (Optional)
To host Judge0 CE via Docker:
```bash
# Run Judge0 CE container on port 2358
docker run -d -p 2358:2358 judge0/judge0:latest
```
*Note: If Judge0 is not running, the platform automatically uses `LocalJavaExecutionAdapter` via your local Java 24 JDK.*

---

## 📁 Project Directory Structure

```
AI-Assisted Coding/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models for User, Question, Attempt, Session, AIInteraction
│   │   └── dev.db              # SQLite Database
│   ├── src/
│   │   ├── controllers/        # Express request controllers
│   │   ├── database/           # Prisma client singleton
│   │   ├── engine/             # StateMachine, ScoringEngine, AdaptiveDifficultyEngine
│   │   ├── providers/
│   │   │   ├── ai/             # AIService, LocalOllamaProvider, RuleBasedAIProvider
│   │   │   └── execution/      # ExecutionService, LocalJavaExecutionAdapter, Judge0Adapter
│   │   ├── routes/             # REST endpoints (/api/questions, /api/assessment, /api/ai)
│   │   ├── seed/               # 118 story-based questions bank & seed runner
│   │   ├── services/           # Question, Assessment, Analytics business services
│   │   ├── types/              # Shared TypeScript definitions
│   │   └── server.ts           # Express entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessment/     # ProblemPanel, GuardedAIPanel, VerificationReportModal
│   │   │   ├── editor/         # MonacoJavaEditor, TestConsolePanel
│   │   │   └── layout/         # Navbar
│   │   ├── pages/              # DashboardPage, AssessmentPage, TopicsPage, HistoryPage, SettingsPage
│   │   ├── services/           # Axios API wrapper
│   │   ├── store/              # Zustand assessment store
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── App.tsx             # Main routing app
│   │   ├── index.css           # Tailwind directives & dark IDE theme
│   │   └── main.tsx            # React mounting point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json                # Root workspace orchestration
└── README.md
```

---

## 🧪 Verification & Testing

To test Java execution and compilation directly:
```bash
cd Backend
npm run test
```

---

## 📄 License
MIT License - Created for free local DSA assessment practice.
