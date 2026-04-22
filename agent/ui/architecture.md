# Component Architecture & Structure Rules

## Overview
This document defines the systematic approach for organizing React components in this project. We follow a "feature-based granular organization" pattern to ensure maintainability, scalability, and clarity.

## Core Principles

### 1. Feature-Based Granularity
Every major feature or complex component must be broken down into small, focused sub-components. Each logical "option" or "section" should have its own dedicated directory.

### 2. Folder-per-Option Structure
Instead of large, monolithic files, organize components into nested folders:
- **Root Component**: `index.tsx` (serves as the assembly point/entry point).
- **Sub-folders**: One folder per logical feature or setting area (e.g., `Theme/`, `Background/`, `Shortcuts/`).
- **Internal Components**: Descriptive filenames inside these folders (e.g., `ThemeLanguageSection.tsx`).

Example Structure:
```
SettingsMenu/
├── index.tsx                 # Main assembly point
├── Theme/
│   └── ThemeLanguageSection.tsx
├── Background/
│   ├── BackgroundSection.tsx
│   └── BackgroundImageDialog.tsx
├── Shortcuts/
│   ├── ActionGrid.tsx
│   └── ResizeShortcutsDialog.tsx
├── Toggles/
│   └── TogglesSection.tsx
└── Clock/
    └── ClockColorDialog.tsx
```

## Implementation Guidelines

### 1. The Assembly Point (`index.tsx`)
The root `index.tsx` should:
- Manage shared state (e.g., dialog visibility, expansion states).
- Import and assemble sub-components.
- Keep JSX clean by delegating sections to specialized components.

### 2. Component Isolation
- Sub-components should call global stores (like `useSettingsStore`) directly if they need complex state.
- Pass simple callbacks or local UI state (like `showMore`) as props if shared between multiple sections.

### 3. Dialog Organization
- Dialogs should be placed in the folder corresponding to the feature they belong to (e.g., `BackgroundImageDialog.tsx` goes into the `Background/` folder).
- Keep dialog logic separate from the main view logic.

## Best Practices
- **Descriptive Naming**: Use names that reflect the component's purpose (e.g., `SearchPositionSection` instead of just `Search`).
- **Clean Imports**: In the root `index.tsx`, group imports by "Sections" and "Dialogs".
- **Lint Compliance**: Always ensure modular components are lint-clean using `pnpm lint`.
- **Modular CSS**: If a component needs specific styles, keep them in the same feature folder.

This structure ensures that as the app grows, every setting and feature remains easy to locate and refactor.
