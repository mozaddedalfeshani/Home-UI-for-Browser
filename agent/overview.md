# LaunchTab - AI Crawler Documentation
# https://github.com/mozaddedalfeshani/Launch-Tab

## Project Overview

LaunchTab is a free, open-source, AI-powered browser new tab dashboard built with Next.js 16, React 19, and TypeScript. It transforms the browser's start page into a customizable productivity dashboard with AI agents, shortcuts, notes, and beautiful themes.

## Core Features

- **Shortcut Management**: Drag-drop customizable shortcuts with visit tracking, auto-ordering by frequency, and keyboard shortcuts
- **AI Sidebar**: Configurable AI agents with per-agent provider selection (OpenAI, DeepSeek, Google, Anthropic), custom rules, and tone presets
- **Notepad System**: Persistent notes with quick search, copy functionality, and sticky alarm reminders
- **Visual Customization**: Light/dark/system themes, dynamic wallpapers, clock customization, layout presets (default/compact/focus)
- **Quick Search**: Modal with multiple search engines and search history
- **Privacy-First**: 100% local storage for user data, API keys never sent to servers

## Tech Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **UI**: React 19.1.0, TypeScript 5, Tailwind CSS 4, Radix UI primitives
- **State**: Zustand 5.0.8
- **AI**: Direct API calls to providers from browser (no proxy server for chat)
- **Storage**: LocalStorage + IndexedDB for media files
- **Icons**: HugeIcons, Lucide React
- **Fonts**: Share Tech Mono, Fredoka (Google Fonts)

## Architecture

### Data Storage Strategy
- User preferences: localStorage (Zustand with persist middleware)
- Large media files: IndexedDB (`launchtab-media-storage`)
- Analytics: Optional MongoDB for anonymous visit counting only

### Key Directories
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - React components organized by feature
- `/src/store/` - Zustand state management stores
- `/src/lib/` - Utility functions and storage helpers
- `/src/hooks/` - Custom React hooks
- `SYSTEM_PROMPT_LANGUAGE.md` - Multi-language implementation rules
- `SYSTEM_PROMPT_ARCHITECTURE.md` - Component structure and organization rules

### State Management
- `settingsStore.ts` - App settings, theme, layout, clock preferences
- `aiSidebarStore.ts` - AI provider configs, agent profiles, chat history
- `notepadStore.ts` - Notes, sticky alarms
- `shortcutsStore.ts` - Shortcut cards, visit counts

## API Routes

- `POST /api/analytics/visit` - Anonymous visit counting
- `POST /api/analytics/search` - Search analytics
- `GET /api/proxy-wallpaper` - Dynamic wallpaper fetching with caching

## AI Integration

AI providers supported via direct browser-to-provider API calls:
- OpenAI (GPT-4, GPT-3.5)
- DeepSeek
- Google (Gemini)
- Anthropic (Claude)

No backend proxy for AI chat - messages go directly from user's browser to provider API.

## Configuration

Users configure via Settings UI:
- AI Provider API keys (stored locally)
- Theme preferences
- Clock position/style
- Layout presets
- Dynamic wallpaper sources

## License

MIT License - See LICENSE file

## Repository

https://github.com/mozaddedalfeshani/Launch-Tab
