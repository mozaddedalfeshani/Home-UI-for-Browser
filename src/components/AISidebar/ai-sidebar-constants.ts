import type {
  AIBehaviorPreset,
  AILanguagePreset,
  AIProvider,
} from "@/store/aiSidebarStore";

export const PROVIDERS: Array<{
  value: AIProvider;
  label: string;
  subtitle: string;
}> = [
  { value: "deepseek", label: "DeepSeek", subtitle: "api.deepseek.com" },
  { value: "openrouter", label: "OpenRouter", subtitle: "openrouter.ai" },
];

export const LANGUAGE_OPTIONS: Array<{
  value: AILanguagePreset;
  label: string;
}> = [
  { value: "english", label: "English" },
  { value: "bangla", label: "Bangla" },
  { value: "auto", label: "Auto Detect" },
];

export const BEHAVIOR_OPTIONS: Array<{
  value: AIBehaviorPreset;
  label: string;
}> = [
  { value: "balanced", label: "Balanced" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
];
