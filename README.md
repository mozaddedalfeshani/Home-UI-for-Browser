# MCLX Home UI for Browser

Personal browser start page, but actually productive.
English-first docs with Bangla flavor, so team-er sobai easily bujhte pare.

MCLX Home UI for Browser is a customizable home dashboard built with Next.js + TypeScript. It combines shortcuts, notes, search, visual customization, and now a strong left AI sidebar with Agent profiles.

## Why this project

Default new-tab pages are often too basic. Ei project-er goal holo:

- Fast daily access to favorite websites
- Clean but rich customization
- Lightweight persistence without backend
- AI assistant integrated directly into the layout

## Core Features

### Home + Shortcuts

- Smart shortcut cards
- Drag and drop reordering
- Visit tracking
- Keyboard shortcut mapping per tab
- Optional open in new window
- Multiple layout presets

### Visual Customization

- Theme modes: light, dark, system
- Clock show/hide, style, position, color, glow
- Shortcut card sizing and radius
- Background image/video upload
- Dynamic wallpaper support through proxy route

### Notepad

- Persistent notes
- Search within notes
- Copy support
- Sticky alarm flow and note utilities

### Search Modal

- Multi-engine search support
- Quick open behavior
- History integration

## New Feature Focus: Left Sidebar Agents

Eta hocche current biggest upgrade.

The left AI sidebar now supports a complete Agent-based workflow so you can switch between different AI personalities/configs instantly.

### What you get

- Agent profile creation from sidebar
- Per-agent provider config: DeepSeek or OpenRouter
- Per-agent model selection: Supports OpenRouter model fetch + manual model entry
- Per-agent API key, rules, language, behavior
- Agent switch menu with active status indicator
- Leave agent mode and return to general config
- Sidebar chat uses active agent profile automatically

### Sidebar capabilities (with agents)

- Streaming AI responses
- Optional send-history behavior for conversation context
- Markdown rendering in AI replies
- Copy AI reply as markdown
- Save AI reply to Notepad with AI-generated title
- Provider-aware error handling for better feedback

### Agent persistence model

Agents are stored locally using Zustand persist, so browser refresh-er por-o profiles thake.

- Agent store keeps profile metadata and timestamps
- AI sidebar store keeps general config + active agent state
- Switching agent applies profile instantly
- Leaving agent mode restores general baseline config

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (persist middleware)
- shadcn/ui + Radix UI
- Hugeicons + Lucide icons
- React Markdown + remark-gfm

## Project Structure

High-level structure:

- src/app: App router, layout, page entry, API routes
- src/components: UI feature modules
- src/store: Zustand stores
- src/hooks: reusable hooks
- src/lib: utility functions and storage helpers

Agent-related component organization (new structure):

- src/components/AgentMenu/index.tsx: Barrel exports for Agent menu module
- src/components/AgentMenu/AgentMenu/index.tsx: Agent switch/dropdown UI
- src/components/AgentMenu/AgentForm/index.tsx: Agent creation form
- src/components/AgentMenu/AgentSheet/index.tsx: Agent creation sheet wrapper
- src/components/AISidebar/index.tsx: Left sidebar AI experience
- src/store/agentStore.ts: Saved Agent profiles
- src/store/aiSidebarStore.ts: Runtime AI config + active agent state

## Getting Started

### Requirements

- Node.js 18+
- Bun recommended (npm/yarn also works)

### Install

1. Clone repo

git clone https://github.com/mozaddedalfeshani/mclx-home-ui-for-browser.git
cd mclx-home-ui-for-browser

2. Install dependencies

bun install

Or:

npm install

3. Run dev server

bun run dev

Open:

http://localhost:3000

### Build and run

bun run build
bun run start

## Available Scripts

- bun run dev: Start development server
- bun run build: Build production bundle
- bun run start: Run production server
- bun run lint: Run ESLint checks

## Usage Guide

### Basic setup flow

1. Open app
2. Configure shortcuts + visuals from settings
3. Use notepad and search modal as needed

### AI sidebar flow

1. Open left sidebar
2. Add provider and API key in setup
3. Optionally tune rules, language, behavior
4. Start chat

### Agent flow (recommended)

1. Open Agent menu (bot icon in sidebar header)
2. Create Agent profile
3. Fill name, description, provider, key, model, rules, language, behavior
4. Switch to agent from dropdown
5. Chat with active agent config
6. Leave agent mode anytime

## Data and Privacy Notes

- This app is frontend-first and stores data locally
- Agent/API settings are persisted in local browser storage
- Background media can use IndexedDB/local storage helpers
- Check privacy-policy.md for project policy details

## Contribution

Contributions are welcome. Bhalo improvements always appreciated.

Suggested flow:

1. Fork repo
2. Create feature branch
3. Commit clearly
4. Open PR with screenshots or short video for UI changes

## License

MIT License.

## Credits

Built with love in Bangladesh.

If this project helps you, repo-te star dite vulben na.
