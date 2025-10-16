# Language Implementation System Prompt

## Overview
This document provides a systematic approach for implementing multi-language support in this Next.js application using the constants-based translation system.

## Translation System Architecture

### 1. Constants Structure
- **File**: `/src/constants/languages.ts`
- **Types**: `Language = "en" | "bn"`
- **Constants**: `LANGUAGES.EN`, `LANGUAGES.BN`
- **Translations**: `TRANSLATIONS[language][key]`
- **Functions**: `getTranslation()`, `useTranslation()`

### 2. Store Integration
- **File**: `/src/store/settingsStore.ts`
- **State**: `language: Language`
- **Default**: `"bn"` (Bangla)
- **Action**: `setLanguage(language: Language)`

## Implementation Pattern

### For Any New Component:

1. **Import Dependencies**:
```typescript
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
```

2. **Get Language State**:
```typescript
const { language } = useSettingsStore();
const t = useTranslation(language);
```

3. **Use Translations**:
```typescript
// Instead of: "Settings"
{t("settings")}

// Instead of: "Add Project"
{t("addProject")}

// Instead of: "Are you sure?"
{t("areYouSure")}
```

### For New Translation Keys:

1. **Add to Constants**:
```typescript
// In /src/constants/languages.ts
export const TRANSLATIONS = {
  [LANGUAGES.EN]: {
    // ... existing keys
    newKey: "English Text",
  },
  [LANGUAGES.BN]: {
    // ... existing keys
    newKey: "বাংলা টেক্সট",
  },
} as const;
```

2. **Use in Component**:
```typescript
{t("newKey")}
```

## Translation Categories

### UI Elements
- Buttons: `add`, `save`, `cancel`, `delete`, `edit`
- Labels: `title`, `description`, `name`, `email`
- Placeholders: `enterTitle`, `writeHere`, `searchPlaceholder`
- Messages: `success`, `error`, `loading`, `noData`

### Navigation
- Menu items: `home`, `settings`, `profile`, `dashboard`
- Breadcrumbs: `back`, `next`, `previous`
- Tabs: `overview`, `details`, `settings`

### Forms
- Validation: `required`, `invalidEmail`, `passwordTooShort`
- Actions: `submit`, `reset`, `clear`
- Status: `saving`, `saved`, `failed`

### Notifications
- Success: `itemCreated`, `itemUpdated`, `itemDeleted`
- Errors: `somethingWentWrong`, `tryAgain`, `contactSupport`
- Warnings: `unsavedChanges`, `confirmAction`

## Best Practices

### 1. Key Naming Convention
- Use camelCase: `addProject`, `editUser`, `deleteItem`
- Be descriptive: `areYouSureDeleteProject` not `confirm`
- Group related keys: `projectTitle`, `projectDescription`

### 2. Translation Quality
- **English**: Clear, concise, professional
- **Bangla**: Natural, culturally appropriate, readable
- **Consistency**: Same term for same concept across app

### 3. Component Structure
```typescript
const MyComponent = () => {
  const { language } = useSettingsStore();
  const t = useTranslation(language);
  
  return (
    <div>
      <h1>{t("pageTitle")}</h1>
      <button>{t("actionButton")}</button>
    </div>
  );
};
```

### 4. Dynamic Content
```typescript
// For dynamic content with variables
const message = t("welcomeMessage").replace("{name}", userName);

// Or use template literals
const message = `${t("welcome")} ${userName}!`;
```

## Common Translation Keys

### Basic Actions
- `add` / `যোগ`
- `edit` / `সম্পাদনা`
- `delete` / `মুছুন`
- `save` / `সংরক্ষণ`
- `cancel` / `বাতিল`
- `close` / `বন্ধ`
- `confirm` / `নিশ্চিত`
- `yes` / `হ্যাঁ`
- `no` / `না`

### Status Messages
- `loading` / `লোড হচ্ছে...`
- `success` / `সফল`
- `error` / `ত্রুটি`
- `saving` / `সংরক্ষণ হচ্ছে...`
- `saved` / `সংরক্ষিত`
- `failed` / `ব্যর্থ`

### Form Labels
- `title` / `শিরোনাম`
- `description` / `বিবরণ`
- `name` / `নাম`
- `email` / `ইমেইল`
- `password` / `পাসওয়ার্ড`
- `required` / `আবশ্যক`

## Implementation Checklist

When adding language support to a new component:

- [ ] Import `useSettingsStore` and `useTranslation`
- [ ] Get `language` state and `t` function
- [ ] Replace all hardcoded strings with `t("key")`
- [ ] Add new translation keys to constants file
- [ ] Test both English and Bangla modes
- [ ] Ensure proper text direction and font support
- [ ] Check for text overflow in different languages
- [ ] Verify all interactive elements work correctly

## Testing Language Implementation

1. **Switch Language**: Use settings menu to toggle between EN/BN
2. **Verify All Text**: Check every visible text element
3. **Test Interactions**: Ensure buttons, forms, dialogs work
4. **Check Layout**: Verify no text overflow or layout issues
5. **Validate Translations**: Ensure Bangla text is accurate and readable

## Future Language Support

To add more languages:

1. **Update Language Type**:
```typescript
export type Language = "en" | "bn" | "ar" | "hi";
```

2. **Add Language Constants**:
```typescript
export const LANGUAGES = {
  EN: "en" as const,
  BN: "bn" as const,
  AR: "ar" as const,
  HI: "hi" as const,
} as const;
```

3. **Add Translations**:
```typescript
export const TRANSLATIONS = {
  // ... existing languages
  [LANGUAGES.AR]: {
    // Arabic translations
  },
  [LANGUAGES.HI]: {
    // Hindi translations
  },
} as const;
```

This system ensures consistent, maintainable, and scalable multi-language support across the entire application.
