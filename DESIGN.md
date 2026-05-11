# Design System: Jarvis "Calm & Premium" OS

## 1. Creative North Star: "The Invisible Orchestrator"
The design should feel like a piece of high-end, futuristic architecture. It is quiet when not in use, but alive when engaged. We avoid loud gradients and "game-like" neon, opting instead for **Subtle Luminance** and **Tonal Depth**.

## 2. Color & Depth: The "Tonal Dark" Philosophy
*   **Base Background:** `#0a0e14` (Deep Space). Not pure black, but a rich, velvety dark blue-gray.
*   **Surfaces:** Use `#161b22` for cards and `#1c2128` for active states.
*   **Accent (The Neural Glow):** `#00f2ff`. Use this sparingly for "active" indicators, voice waves, and primary action buttons. It should feel like light glowing from behind frosted glass.

## 3. Typography: Sophisticated Clarity
*   **Headline Font:** Outfit (Modern, geometric, yet soft).
*   **Body Font:** Inter (Functional, readable, tech-forward).
*   **Scale:** Use large, airy line-heights (`1.6`) to prevent information density from feeling overwhelming.

## 4. Components: "Frosted Glass" (Glassmorphism)
*   **Sidebar & Header:** Use `backdrop-filter: blur(24px)` with a very subtle white border (`1px solid rgba(255, 255, 255, 0.05)`).
*   **Message Bubbles:**
    *   **Assistant:** Soft background (`#1c2128`) with no border.
    *   **User:** Slightly more prominent (`#238636` for action, but keep it muted) or just a simple secondary gray.

## 5. Motion: "Breathable" Transitions
*   **Transitions:** All state changes should use a `0.8s cubic-bezier(0.4, 0, 0.2, 1)` transition. Nothing should "snap"; it should "evolve."
*   **The Pulse:** Active AI states use a soft, slow pulse (`animate-pulse-slow`) with a scale change of only 1-2%.
