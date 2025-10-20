<!-- 120b82d5-6a1a-4973-9bb8-e2957074f6a7 a3188661-a7d4-4f76-8071-73c40e692c18 -->
# Quick Search Modal Implementation

## Overview

Add a global search modal triggered by "/" key that intelligently searches Google or navigates to URLs based on input format.

## Implementation Steps

### 1. Create SearchModal Component

- **File**: `src/components/SearchModal/index.tsx`
- Create a dialog component with single input field
- Handle Enter key to process search/navigation
- Handle Escape key or click outside to close
- Focus input automatically when modal opens

### 2. Add Search Logic

- Parse input to detect if it's a URL (contains `.com`, `.org`, `.net`, etc.)
- If URL detected: add `https://` prefix if missing, navigate directly
- If not URL: construct Google search URL with query parameter
- Open result in new tab using `window.open()`

### 3. Update useKeyboardShortcuts Hook

- **File**: `src/hooks/useKeyboardShortcuts.ts`
- Add "/" key detection to open search modal
- Skip "/" trigger when user is typing in input fields (check `event.target` is `input`, `textarea`, or has `contenteditable`)
- Ensure existing tab shortcuts still work

### 4. Integrate Modal in PageClient

- **File**: `src/app/PageClient.tsx`
- Add state for modal open/close
- Pass state to SearchModal component
- Render SearchModal at root level

## Key Technical Details

**URL Detection Logic**: Check if input matches pattern `\.(com|org|net|io|dev|app|co)` or starts with `http://` or `https://`

**Input Field Detection**: Check `event.target.tagName.toLowerCase()` is in `['input', 'textarea']` or has `contenteditable` attribute

**Keyboard Shortcuts Priority**: Existing tab shortcuts (Ctrl/Alt/Shift/Meta combinations) should take precedence over "/" search trigger

### To-dos

- [ ] Create SearchModal component with input field and open/close logic
- [ ] Add URL detection and Google search navigation logic
- [ ] Modify useKeyboardShortcuts to handle '/' key and prevent conflicts with input fields
- [ ] Add SearchModal to PageClient and wire up state management