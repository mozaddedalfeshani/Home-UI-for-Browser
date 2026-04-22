"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  AIBehaviorPreset,
  AILanguagePreset,
  AIProvider,
} from "@/store/aiSidebarStore";
import { useAgentStore } from "@/store/agentStore";

const PROVIDERS: Array<{ value: AIProvider; label: string }> = [
  { value: "deepseek", label: "DeepSeek" },
  { value: "openrouter", label: "OpenRouter" },
];

const LANGUAGES: Array<{ value: AILanguagePreset; label: string }> = [
  { value: "english", label: "English" },
  { value: "bangla", label: "Bangla" },
  { value: "auto", label: "Auto Detect" },
];

const BEHAVIORS: Array<{ value: AIBehaviorPreset; label: string }> = [
  { value: "balanced", label: "Balanced" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
];

interface OpenRouterModelOption {
  id: string;
  name: string;
  description: string;
  contextLength: number | null;
}

interface AgentFormProps {
  onCreated: () => void;
}

const DEEPSEEK_DEFAULT_MODEL = "deepseek-chat";
const OPENROUTER_DEFAULT_MODEL = "openrouter/auto";

export function AgentForm({ onCreated }: AgentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState<AIProvider>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEEPSEEK_DEFAULT_MODEL);
  const [rules, setRules] = useState("");
  const [language, setLanguage] = useState<AILanguagePreset>("english");
  const [behavior, setBehavior] = useState<AIBehaviorPreset>("balanced");
  const [isSaving, setIsSaving] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<
    OpenRouterModelOption[]
  >([]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const addAgent = useAgentStore((state) => state.addAgent);

  useEffect(() => {
    if (provider === "deepseek" && model === OPENROUTER_DEFAULT_MODEL) {
      setModel(DEEPSEEK_DEFAULT_MODEL);
    }

    if (provider === "openrouter" && model === DEEPSEEK_DEFAULT_MODEL) {
      setModel(OPENROUTER_DEFAULT_MODEL);
    }
  }, [provider, model]);

  useEffect(() => {
    if (!isModelsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsModelsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelsOpen]);

  useEffect(() => {
    if (
      !isModelsOpen ||
      provider !== "openrouter" ||
      availableModels.length > 0 ||
      isLoadingModels
    ) {
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      setModelsError(null);

      try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: apiKey.trim()
            ? { Authorization: `Bearer ${apiKey.trim()}` }
            : undefined,
        });

        const payload = (await response.json()) as {
          data?: Array<{
            id?: string;
            name?: string;
            description?: string;
            context_length?: number | null;
          }>;
          error?: {
            message?: string;
            metadata?: {
              raw?: string;
            };
          };
        };

        if (!response.ok) {
          throw new Error(
            payload.error?.metadata?.raw?.trim() ||
              payload.error?.message ||
              "Unable to load OpenRouter models.",
          );
        }

        const models = (payload.data ?? [])
          .map((item) => {
            const id = item.id?.trim();
            if (!id) {
              return null;
            }

            return {
              id,
              name: item.name?.trim() || id,
              description:
                item.description?.trim() || "No description available.",
              contextLength:
                typeof item.context_length === "number"
                  ? item.context_length
                  : null,
            };
          })
          .filter((item): item is OpenRouterModelOption => Boolean(item))
          .sort((a, b) => a.id.localeCompare(b.id));

        setAvailableModels(models);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load OpenRouter models.";
        setModelsError(message);
        toast.error(message);
      } finally {
        setIsLoadingModels(false);
      }
    };

    void fetchModels();
  }, [apiKey, availableModels.length, isLoadingModels, isModelsOpen, provider]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setProvider("deepseek");
    setApiKey("");
    setModel(DEEPSEEK_DEFAULT_MODEL);
    setRules("");
    setLanguage("english");
    setBehavior("balanced");
    setFieldError(null);
    setIsModelsOpen(false);
  };

  const handleCreateAgent = () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedApiKey = apiKey.trim();
    const trimmedModel = model.trim();
    const trimmedRules = rules.trim();

    if (
      !trimmedName ||
      !trimmedDescription ||
      !trimmedApiKey ||
      !trimmedModel ||
      !trimmedRules
    ) {
      setFieldError("Please fill in all required fields.");
      return;
    }

    setFieldError(null);
    setIsSaving(true);

    try {
      addAgent({
        name: trimmedName,
        description: trimmedDescription,
        type: "generic",
        provider,
        apiKey: trimmedApiKey,
        model: trimmedModel,
        rules: trimmedRules,
        language,
        behavior,
      });
      toast.success("Agent created successfully.");
      resetForm();
      onCreated();
    } catch {
      toast.error("Failed to save the agent.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Agent Name
          </label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Slack helper"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Type</label>
          <select
            value="generic"
            disabled
            className="border-input dark:bg-input/30 flex h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            <option value="generic">Generic</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this agent is responsible for..."
          className="min-h-20 rounded-xl text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Provider
          </label>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as AIProvider)}
            className="border-input dark:bg-input/30 flex h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            {PROVIDERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            API Key
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={`Enter ${provider} API key`}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Model</label>
        <div className="flex gap-2">
          <Input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="Model name"
            className="h-11 rounded-xl"
          />
          {provider === "openrouter" ? (
            <div className="relative" ref={popoverRef}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModelsOpen((current) => !current)}
                className="h-11 rounded-xl"
              >
                Models
              </Button>
              {isModelsOpen ? (
                <div className="absolute bottom-full right-0 mb-2 w-72 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="mb-2 px-2 py-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      OpenRouter Models
                    </p>
                  </div>

                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setModel(OPENROUTER_DEFAULT_MODEL);
                        setIsModelsOpen(false);
                      }}
                      className={cn(
                        "flex w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        model === OPENROUTER_DEFAULT_MODEL
                          ? "bg-primary/12 text-primary"
                          : "hover:bg-muted/70",
                      )}
                    >
                      openrouter/auto
                    </button>
                    {isLoadingModels ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading models...
                      </div>
                    ) : modelsError ? (
                      <div className="px-3 py-3 text-sm text-destructive">
                        {modelsError}
                      </div>
                    ) : (
                      availableModels.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setModel(item.id);
                            setIsModelsOpen(false);
                          }}
                          title={`${item.name}\n${item.description}`}
                          className={cn(
                            "flex w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                            model === item.id
                              ? "bg-primary/12 text-primary"
                              : "hover:bg-muted/70",
                          )}
                        >
                          <span className="truncate">{item.id}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Rules</label>
        <Textarea
          value={rules}
          onChange={(event) => setRules(event.target.value)}
          placeholder="Define the agent system rules..."
          className="min-h-24 rounded-xl text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Language
          </label>
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as AILanguagePreset)
            }
            className="border-input dark:bg-input/30 flex h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Behavior
          </label>
          <select
            value={behavior}
            onChange={(event) =>
              setBehavior(event.target.value as AIBehaviorPreset)
            }
            className="border-input dark:bg-input/30 flex h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            {BEHAVIORS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fieldError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fieldError}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={handleCreateAgent}
        disabled={isSaving}
        className="h-11 w-full rounded-xl"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create Agent
      </Button>
    </div>
  );
}
