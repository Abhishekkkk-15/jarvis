<div align="center">

<h1>🤖 Jarvis — Autonomous Desktop AI Agent</h1>

<p>A production-grade, fully customizable AI desktop assistant built on Electron, NestJS, and LangChain. Runs locally on your machine with full OS-level automation, persistent long-term memory, custom identity, voice synthesis, and a premium dark-mode UI.</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D20.0.0-green)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0-orange)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

</div>

---

## ✨ Features

### 🧠 AI & Intelligence
- **Configurable AI Identity** — Rename the agent to anything (Alaska, Friday, Nova…). The name persists across sessions and automatically adjusts voice pitch and style presets.
- **Dynamic System Prompts** — Agent identity is injected at runtime; the AI never reverts to a hardcoded persona.
- **Long-Term Persistent Memory** — Vector-backed memory store. The agent remembers user details, preferences, and facts across sessions. Supports autonomous `save_memory`, `search_memory`, and `delete_memory`.
- **Multi-Provider AI** — Plug-and-play support for **Groq** and **NVIDIA NIM** via a unified LangChain provider abstraction.
- **Tool Calling** — 15+ categories of tools: OS automation, browser control, file system, terminal, vision, memory, email, git, web search, database introspection, and agentic sub-tasks.

### 🎙️ Voice
- **Premium TTS** — High-fidelity speech synthesis via Groq Orpheus or NVIDIA Studio TTS.
- **Push-to-Talk STT** — Real-time speech-to-text via browser-native Speech Recognition.
- **Auto Voice Tuning** — Changing the agent's name automatically maps to the most fitting voice persona and pitch profile (masculine/feminine, deep/bright).
- **Per-Voice Personas** — Pre-defined library of voice characters: The Strategist, The Commander, The Virtual Guide, The Librarian, and more.

### ⚡ OS Automation
- **Desktop Macro Engine** — Execute saved multi-step sequences (click, type, key combos, vision-based GUI targeting) triggered by natural language: _"execute workspace launcher sequence"_.
- **Browser Automation** — Headless Playwright integration for web interaction, scraping, and URL navigation.
- **Terminal Control** — Execute shell commands and PowerShell scripts directly.
- **Screenshot + Vision** — Capture the active desktop and analyze UI state with vision models.

### 🔒 Session & Memory Architecture
- **UUID-isolated Conversation Threads** — Every session runs in its own isolated thread preventing context bleed.
- **Rotate Context** — Instantly start a fresh session with a single click without restarting the app.
- **Auto-synced Settings** — All preferences (theme, voice, agent name) persist to the database and are loaded reactively on startup.

### 🖥️ Desktop Experience
- **Packaged Installer** — Ships as a single `.exe` / `.dmg` / `.AppImage`. The NestJS backend is bundled inside the Electron app and launches automatically — users double-click to run, no setup needed.
- **Premium UI** — Dark-mode glassmorphism design with animated micro-interactions, Framer Motion transitions, and a command palette.
- **Custom Titlebar** — Frameless window with custom minimize/maximize/close controls.
- **Theme Switching** — Multiple built-in themes synced reactively to the UI.

---

## 🏗️ Architecture

```
jarvis/
├── apps/
│   ├── desktop/          # Electron + React + Vite (UI layer)
│   │   └── electron/     # Main process: window management + backend spawning
│   └── server/           # NestJS control plane (REST + WebSocket)
│       ├── gateways/     # WebSocket chat gateway
│       ├── controllers/  # REST endpoints (settings, history, workflows)
│       └── services/     # AI, TTS, STT, Memory, Tools, Execution, Vision…
│
└── packages/
    ├── ai/               # LangChain provider abstraction (Groq, NVIDIA)
    ├── agents/           # LangGraph agent runtime + planner + reflector
    ├── database/         # Drizzle ORM schema + PostgreSQL migrations
    ├── tools/            # Tool registry & 15+ category definitions
    ├── shared/           # Shared TypeScript types and constants
    ├── vision/           # Vision model integration
    ├── voice/            # Voice synthesis helpers
    └── browser/          # Playwright browser automation
```

**Communication Flow:**
```
[Electron Renderer] ←WebSocket→ [NestJS Gateway] → [AI Service] → [Tool Execution]
                                        ↓
                               [PostgreSQL via Drizzle]
                            (conversations, messages, memory, settings, workflows)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm 9
- PostgreSQL (local or remote)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/jarvis.git
cd jarvis
pnpm install
```

### 2. Environment Variables

Create `apps/server/.env`:

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/jarvis

# AI Providers (at least one required)
GROQ_API_KEY=your_groq_api_key
NVIDIA_API_KEY=your_nvidia_api_key      # optional, for Studio TTS
```

### 3. Push Database Schema

```bash
pnpm db:push
```

### 4. Run in Development

```bash
pnpm dev
```

This starts both the **NestJS backend** and **Electron desktop app** concurrently via Turborepo.

---

## 📦 Building the Installer

Build the server first, then package the desktop app. The compiled server is automatically bundled inside the installer as a resource — users don't need Node.js or any runtime installed.

```bash
# 1. Compile the backend
pnpm --filter jarvis-server build

# 2. Package the Electron app + bundled server → apps/desktop/release/
pnpm --filter jarvis-desktop build
```

Output: `apps/desktop/release/Jarvis Setup.exe` (Windows), `.dmg` (macOS), `.AppImage` (Linux).

---

## 🧹 Maintenance Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm clean` | Delete all `dist/`, `dist-electron/`, `release/` folders |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:push` | Push schema to the database |

---

## 🛠️ Tool Categories

The agent has access to 15+ tool categories callable via natural language:

| Category | Example Tools |
|---|---|
| **System** | `get_system_info`, `notification_send` |
| **File System** | `read_file`, `write_file`, `list_directory` |
| **Terminal** | `execute_command`, `execute_powershell` |
| **Browser** | `open_url`, `web_search`, `take_screenshot` |
| **Desktop** | `mouse_click`, `keyboard_type`, `screen_capture` |
| **Vision** | `analyze_image`, `capture_screen` |
| **Memory** | `save_memory`, `search_memory`, `delete_memory` |
| **Preferences** | `save_user_preference` |
| **Workflows** | `execute_workflow`, `create_workflow` |
| **Development** | `git_status` |
| **Communication** | `send_email` |
| **Agentic** | `create_subtask` |

---

## 🎭 Agent Identity & Voice Profiles

Change the agent name in **Settings → Agent Name**. The system automatically tunes voice parameters:

| Name Pattern | Voice Preset | Style |
|---|---|---|
| Alaska, Friday, Diana, Nova, Sarah | `groq-autumn-v1` | Bright, clear, fast cadence |
| Jarvis, Butler, David, Austin | `groq-austin` | Deep, resonant, authoritative |
| Custom | Manual selection | Full voice library available |

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `conversations` | UUID-isolated chat threads |
| `messages` | Per-thread message history |
| `memories` | Vector-stored long-term user facts |
| `settings` | Key-value user preferences (theme, voice, agent name) |
| `workflows` | Saved macro automation scripts |
| `workflow_runs` | Execution history and logs |

---

## 📁 Key Files

| File | Purpose |
|---|---|
| `apps/desktop/electron/main.ts` | Electron main process — spawns backend, manages windows |
| `apps/server/src/gateways/chat.gateway.ts` | WebSocket handler — routes messages to AI |
| `apps/server/src/services/ai.service.ts` | Core AI orchestration — system prompts, tool calls, streaming |
| `apps/server/src/services/settings.service.ts` | Settings persistence + voice auto-tuning |
| `apps/server/src/services/memory.service.ts` | Vector memory store — save, search, delete |
| `apps/server/src/services/tool.service.ts` | Tool execution engine — binds all 15+ tool categories |
| `packages/tools/src/index.ts` | Tool registry — central schema definitions |
| `packages/database/src/schema.ts` | Drizzle schema definitions |

---

## 📄 License

MIT © 2025 — Built with ❤️ using Electron, NestJS, LangChain, and Groq.
