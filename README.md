# JARVIS - Desktop AI Assistant

Production-grade boilerplate for a desktop AI assistant.

## Tech Stack
- **Desktop**: Electron + React + Vite + TailwindCSS
- **Server**: NestJS + PostgreSQL + Drizzle
- **AI**: LangGraph + Groq + NVIDIA NIM
- **Automation**: Playwright (Browser) + nut.js (Desktop)

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create `.env` in `apps/server`:
   ```env
   DATABASE_URL=postgres://user:pass@localhost:5432/jarvis
   GROQ_API_KEY=your_key
   NVIDIA_API_KEY=your_key
   ```

3. **Run Development**
   ```bash
   pnpm dev
   ```

## Folder Structure
- `apps/desktop`: Electron/React frontend
- `apps/server`: NestJS control plane
- `packages/ai`: AI provider abstractions
- `packages/database`: Drizzle schema and migrations
- `packages/tools`: Tool registry and definitions
- `packages/shared`: Shared types and constants

## Features
- [x] Monorepo architecture
- [x] Real-time WebSocket communication
- [x] Premium Linear-inspired UI
- [x] AI Provider abstraction (Groq/NVIDIA)
- [x] Tool calling registry
- [x] Persistent memory schema
- [x] Command Palette (Cmd+K)
