"use client";

import { useEffect, useState } from "react";
import {
  AiIdeaIcon,
  ArrowLeft01Icon,
  BotIcon,
  Delete02Icon,
  Key02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AgentForm } from "@/components/AgentMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  AIBehaviorPreset,
  AILanguagePreset,
  AIProvider,
} from "@/store/aiSidebarStore";
import type { AgentType } from "@/store/agentStore";
import {
  BEHAVIOR_OPTIONS,
  LANGUAGE_OPTIONS,
  PROVIDERS,
} from "./ai-sidebar-constants";

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  provider: AIProvider;
  apiKey: string;
  model: string;
  rules: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
}

interface AISidebarSetupProps {
  isConfigured: boolean;
  isAgentCreateMode: boolean;
  isAgentEditMode?: boolean;
  agentInfo?: AgentInfo | null;
  provider: AIProvider;
  apiKey: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
  rules: string;
  providerLabel: string;
  onBack: () => void;
  onSetProvider: (p: AIProvider) => void;
  onSetApiKey: (v: string) => void;
  onSetLanguage: (v: AILanguagePreset) => void;
  onSetBehavior: (v: AIBehaviorPreset) => void;
  onSetRules: (v: string) => void;
  onSetupComplete: () => void;
  onAgentCreated: () => void;
  onAgentSave?: (updates: Partial<AgentInfo>) => void;
  onResetAI?: () => void;
}

export function AISidebarSetup({
  isConfigured,
  isAgentCreateMode,
  isAgentEditMode,
  agentInfo,
  provider,
  apiKey,
  language,
  behavior,
  rules,
  providerLabel,
  onBack,
  onSetProvider,
  onSetApiKey,
  onSetLanguage,
  onSetBehavior,
  onSetRules,
  onSetupComplete,
  onAgentCreated,
  onAgentSave,
  onResetAI,
}: AISidebarSetupProps) {
  const [setupStep, setSetupStep] = useState(1);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Agent edit state
  const [editAgentName, setEditAgentName] = useState(agentInfo?.name || "");
  const [editAgentDescription, setEditAgentDescription] = useState(
    agentInfo?.description || "",
  );
  const [editAgentRules, setEditAgentRules] = useState(agentInfo?.rules || "");
  const [editAgentLanguage, setEditAgentLanguage] = useState(
    agentInfo?.language || "auto",
  );
  const [editAgentBehavior, setEditAgentBehavior] = useState(
    agentInfo?.behavior || "professional",
  );

  useEffect(() => {
    if (agentInfo) {
      setEditAgentName(agentInfo.name);
      setEditAgentDescription(agentInfo.description);
      setEditAgentRules(agentInfo.rules);
      setEditAgentLanguage(agentInfo.language);
      setEditAgentBehavior(agentInfo.behavior);
    }
  }, [agentInfo]);

  const handleSetupSubmit = () => {
    if (!apiKey.trim()) {
      setErrorMessage("Please enter an API key to continue.");
      return;
    }
    setErrorMessage(null);
    onSetupComplete();
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
      {isConfigured || isAgentCreateMode || isAgentEditMode ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 mb-4 h-8 w-fit gap-2 text-muted-foreground hover:text-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2} />
          Back to chat
        </Button>
      ) : null}

      {isAgentEditMode && agentInfo ? (
        /* Agent Info/Edit Mode */
        <div className="space-y-5">
          <div className="mb-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-indigo-400">
              <HugeiconsIcon icon={BotIcon} size={18} strokeWidth={2} />
              <span className="text-sm font-semibold">{agentInfo.name}</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
                {agentInfo.type === "predefined"
                  ? "System Agent"
                  : "Custom Agent"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Agent Name
              </label>
              <Input
                value={editAgentName}
                onChange={(e) => setEditAgentName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Description
              </label>
              <Input
                value={editAgentDescription}
                onChange={(e) => setEditAgentDescription(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setEditAgentLanguage(item.value)}
                    className={cn(
                      "rounded-xl border py-2.5 text-sm font-medium transition-all duration-150",
                      editAgentLanguage === item.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Behavior
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BEHAVIOR_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setEditAgentBehavior(item.value)}
                    className={cn(
                      "rounded-xl border py-2.5 text-sm font-medium transition-all duration-150",
                      editAgentBehavior === item.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                System Rules
              </label>
              <Textarea
                value={editAgentRules}
                onChange={(e) => setEditAgentRules(e.target.value)}
                className="min-h-32 rounded-xl text-sm"
              />
            </div>

            <Button
              type="button"
              onClick={() => {
                if (agentInfo && onAgentSave) {
                  onAgentSave({
                    name: editAgentName,
                    description: editAgentDescription,
                    rules: editAgentRules,
                    language: editAgentLanguage,
                    behavior: editAgentBehavior,
                  });
                }
              }}
              className="h-11 w-full rounded-xl gap-2">
              Save Changes
            </Button>
          </div>
        </div>
      ) : isAgentCreateMode ? (
        <>
          <div className="mb-5 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <HugeiconsIcon icon={AiIdeaIcon} size={18} strokeWidth={2} />
              <span className="text-sm font-semibold">Create an agent</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              A dedicated profile with its own provider, model, API key, rules,
              language, and behavior.
            </p>
          </div>
          <AgentForm onCreated={onAgentCreated} />
        </>
      ) : (
        <>
          {/* Step progress indicator */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-1 items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200",
                      setupStep === s
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : setupStep > s
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={cn(
                        "h-px flex-1 rounded-full transition-all duration-300",
                        setupStep > s ? "bg-primary/40" : "bg-border/50",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {setupStep === 1 && "Step 1 of 3 — Choose provider"}
              {setupStep === 2 && "Step 2 of 3 — API key"}
              {setupStep === 3 && "Step 3 of 3 — Preferences"}
            </p>
          </div>

          {/* Step 1 — Provider */}
          {setupStep === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Choose a provider
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your credentials are saved locally and never leave your
                  device.
                </p>
              </div>
              <div className="grid gap-3">
                {PROVIDERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onSetProvider(item.value)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
                      provider === item.value
                        ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                        : "border-border/60 bg-card/30 hover:border-primary/30 hover:bg-primary/5",
                    )}>
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-colors",
                        provider === item.value
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : "border-border/50 bg-muted/50 text-muted-foreground",
                      )}>
                      {item.label[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full transition-all",
                        provider === item.value
                          ? "bg-primary"
                          : "bg-transparent",
                      )}
                    />
                  </button>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => setSetupStep(2)}
                className="h-11 w-full rounded-xl">
                Continue
              </Button>
            </div>
          )}

          {/* Step 2 — API Key */}
          {setupStep === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Enter your API key
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stored only in your browser — never sent to any server.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {providerLabel} API Key
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => onSetApiKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && apiKey.trim()) {
                        setErrorMessage(null);
                        setSetupStep(3);
                      }
                    }}
                    placeholder="sk-..."
                    className="h-12 rounded-xl pr-12"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowApiKey((c) => !c)}
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}>
                    <HugeiconsIcon icon={Key02Icon} size={18} strokeWidth={2} />
                  </Button>
                </div>
              </div>
              {errorMessage ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setErrorMessage(null);
                    setSetupStep(1);
                  }}
                  className="h-11 flex-1 rounded-xl">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (!apiKey.trim()) {
                      setErrorMessage("Please enter your API key to continue.");
                      return;
                    }
                    setErrorMessage(null);
                    setSetupStep(3);
                  }}
                  className="h-11 flex-1 rounded-xl">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Preferences */}
          {setupStep === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Set your preferences
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Optional — you can change these anytime from settings.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onSetLanguage(item.value)}
                      className={cn(
                        "rounded-xl border py-2.5 text-sm font-medium transition-all duration-150",
                        language === item.value
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Behavior
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BEHAVIOR_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onSetBehavior(item.value)}
                      className={cn(
                        "rounded-xl border py-2.5 text-sm font-medium transition-all duration-150",
                        behavior === item.value
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Custom Rules{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Textarea
                  value={rules}
                  onChange={(e) => onSetRules(e.target.value)}
                  placeholder="e.g. Always reply concisely. Avoid markdown."
                  className="min-h-20 rounded-xl text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSetupStep(2)}
                  className="h-11 flex-1 rounded-xl">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSetupSubmit}
                  className="h-11 flex-1 rounded-xl">
                  Start chatting
                </Button>
              </div>

              {/* Reset AI button - only show when already configured */}
              {isConfigured && onResetAI ? (
                <div className="mt-6 border-t border-border/50 pt-4">
                  <button
                    type="button"
                    onClick={onResetAI}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      size={16}
                      strokeWidth={2}
                    />
                    Reset AI — Clear all settings and start over
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
