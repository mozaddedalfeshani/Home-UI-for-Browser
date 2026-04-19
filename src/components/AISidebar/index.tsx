"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNotepadStore } from "@/store/notepadStore";
import { useAISidebarStore } from "@/store/aiSidebarStore";
import { useAgentStore } from "@/store/agentStore";
import { AISidebarHeader } from "./ai-sidebar-header";
import { AISidebarSetup } from "./ai-sidebar-setup";
import { AISidebarChat } from "./ai-sidebar-chat";
import { AISidebarComposer } from "./ai-sidebar-composer";
import {
  getProviderConfig,
  getSystemPrompt,
  getTitlePrompt,
  extractDeltaContent,
  extractMessageContent,
  getProviderErrorMessage,
} from "./ai-sidebar-utils";
import { PROVIDERS } from "./ai-sidebar-constants";

interface AISidebarProps {
  open: boolean;
  onClose: () => void;
}

const AISidebar = ({ open, onClose }: AISidebarProps) => {
  const [draftMessage, setDraftMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const [copyingMessageId, setCopyingMessageId] = useState<string | null>(null);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [isAgentCreateMode, setIsAgentCreateMode] = useState(false);
  const [isAgentEditMode, setIsAgentEditMode] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const modelsPopoverRef = useRef<HTMLDivElement | null>(null);

  const {
    provider,
    apiKey,
    openRouterModel,
    rules,
    language,
    behavior,
    activeAgentId,
    activeAgentName,
    sendHistory,
    messages,
    isConfigured,
    setProvider,
    setApiKey,
    setOpenRouterModel,
    setRules,
    setLanguage,
    setBehavior,
    setSendHistory,
    completeSetup,
    clearActiveAgent,
    resetSetup,
    addMessage,
    updateMessageContent,
    clearMessages,
  } = useAISidebarStore();
  const addNote = useNotepadStore((state) => state.addNote);
  const agents = useAgentStore((state) => state.agents);

  const providerMeta = useMemo(
    () => PROVIDERS.find((item) => item.value === provider) ?? PROVIDERS[0],
    [provider],
  );

  // Enhanced label showing model name for OpenRouter
  const providerLabel = useMemo(() => {
    if (provider === "openrouter" && openRouterModel) {
      // Extract just the model name without org prefix for brevity
      const shortModel = openRouterModel.includes("/")
        ? openRouterModel.split("/").slice(1).join("/")
        : openRouterModel;
      return `OpenRouter · ${shortModel}`;
    }
    return providerMeta.label;
  }, [provider, openRouterModel, providerMeta.label]);

  useEffect(() => {
    if (!open) {
      return;
    }

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  useEffect(() => {
    if (!isModelsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelsPopoverRef.current &&
        !modelsPopoverRef.current.contains(event.target as Node)
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
            ? {
                Authorization: `Bearer ${apiKey.trim()}`,
              }
            : undefined,
        });

        const payload = (await response.json()) as {
          data?: Array<{ id?: string }>;
          error?: { message?: string };
        };

        if (!response.ok) {
          throw new Error(
            getProviderErrorMessage(
              payload,
              "Unable to load OpenRouter models.",
            ),
          );
        }

        const modelIds = (payload.data ?? [])
          .map((item) => item.id?.trim())
          .filter((item): item is string => Boolean(item))
          .sort((first, second) => first.localeCompare(second));

        setAvailableModels(modelIds.length ? modelIds : ["openrouter/auto"]);
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

  const generateNoteTitle = async (content: string) => {
    const providerConfig = getProviderConfig(
      provider,
      apiKey.trim(),
      openRouterModel,
    );

    const response = await fetch(providerConfig.endpoint, {
      method: "POST",
      headers: providerConfig.headers,
      body: JSON.stringify({
        ...providerConfig.bodyBase,
        stream: false,
        messages: [
          {
            role: "system",
            content: getTitlePrompt(rules, language),
          },
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(
        getProviderErrorMessage(
          payload,
          "Unable to generate a note title right now.",
        ),
      );
    }

    const title = extractMessageContent(payload)
      .replace(/^["'`]+|["'`]+$/g, "")
      .trim();

    if (!title) {
      throw new Error("The AI did not return a usable note title.");
    }

    return title;
  };

  const handleSaveMessageToNote = async (
    messageId: string,
    content: string,
  ) => {
    if (savingMessageId || !content.trim()) {
      return;
    }

    if (!apiKey.trim()) {
      const message = "Add your API key first.";
      setErrorMessage(message);
      setIsConfigMode(true);
      toast.error(message);
      return;
    }

    setSavingMessageId(messageId);

    try {
      const title = await generateNoteTitle(content);
      addNote({
        title,
        content,
      });
      toast.success("Note created from AI reply.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create a note from this AI reply.";
      toast.error(message);
    } finally {
      setSavingMessageId(null);
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage || isSubmitting) {
      return;
    }

    if (!apiKey.trim()) {
      setErrorMessage("Add your API key first.");
      setIsConfigMode(true);
      return;
    }

    const nextUserMessage = { role: "user" as const, content: trimmedMessage };
    addMessage(nextUserMessage);
    setDraftMessage("");
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const providerConfig = getProviderConfig(
        provider,
        apiKey.trim(),
        openRouterModel,
      );
      const systemPrompt = getSystemPrompt(rules, language, behavior);
      const payloadMessages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...(sendHistory
          ? [
              ...messages,
              { id: "pending", createdAt: Date.now(), ...nextUserMessage },
            ].map((message) => ({
              role: message.role,
              content: message.content,
            }))
          : [nextUserMessage]),
      ];

      const response = await fetch(providerConfig.endpoint, {
        method: "POST",
        headers: providerConfig.headers,
        body: JSON.stringify({
          ...providerConfig.bodyBase,
          stream: true,
          messages: payloadMessages,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: {
            message?: string;
            code?: number | string;
            metadata?: {
              raw?: string;
              provider_name?: string;
            };
          };
        };
        throw new Error(
          getProviderErrorMessage(
            payload,
            "Unable to reach the provider right now.",
          ),
        );
      }

      const assistantMessageId = addMessage({
        role: "assistant",
        content: "",
      });

      if (!response.body) {
        updateMessageContent(
          assistantMessageId,
          "No response stream returned.",
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let pendingChunk = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        pendingChunk += decoder.decode(value, { stream: true });
        const events = pendingChunk.split("\n\n");
        pendingChunk = events.pop() ?? "";

        for (const event of events) {
          const lines = event
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }

            const jsonPayload = line.slice(5).trim();

            if (!jsonPayload || jsonPayload === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(jsonPayload) as unknown;
              const nextDelta = extractDeltaContent(parsed);

              if (!nextDelta) {
                continue;
              }

              accumulatedContent += nextDelta;
              updateMessageContent(assistantMessageId, accumulatedContent);
            } catch {
              // Ignore non-JSON event payloads in the stream.
            }
          }
        }
      }

      const trailingChunk = pendingChunk.trim();
      if (trailingChunk.startsWith("data:")) {
        const trailingPayload = trailingChunk.slice(5).trim();
        if (trailingPayload && trailingPayload !== "[DONE]") {
          try {
            const parsed = JSON.parse(trailingPayload) as unknown;
            const nextDelta = extractDeltaContent(parsed);
            if (nextDelta) {
              accumulatedContent += nextDelta;
            }
          } catch {
            // Ignore trailing payload parsing failures.
          }
        }
      }

      updateMessageContent(
        assistantMessageId,
        accumulatedContent || "No response content returned.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the message.";

      toast.error(message);
      addMessage({
        role: "assistant",
        content: `Error: ${message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      setCopyingMessageId(messageId);
      await navigator.clipboard.writeText(content);
      toast.success("Markdown copied.");
    } catch {
      toast.error("Failed to copy markdown.");
    } finally {
      setCopyingMessageId(null);
    }
  };

  const showSetup = !isConfigured || isConfigMode;
  const showSidebarForm = showSetup || isAgentCreateMode || isAgentEditMode;

  const handleEditAgent = (agentId: string) => {
    setEditingAgentId(agentId);
    setIsAgentEditMode(true);
    setIsConfigMode(false);
    setIsAgentCreateMode(false);
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="h-full overflow-hidden rounded-r-3xl border-r border-border/60 bg-background/78 text-foreground shadow-2xl backdrop-blur-2xl transition-all duration-300">
        <div className="flex h-full flex-col">
          <AISidebarHeader
            activeAgentName={activeAgentName}
            providerLabel={providerLabel}
            showSetup={showSetup}
            isAgentMode={Boolean(activeAgentId)}
            onSettingsOpen={() => {
              setIsAgentCreateMode(false);
              setIsAgentEditMode(false);
              setEditingAgentId(null);
              setErrorMessage(null);
              setIsConfigMode(true);
            }}
            onAgentInfoOpen={() => {
              // Open agent edit/info mode - for predefined agents, this shows info only
              if (activeAgentId) {
                setIsConfigMode(false);
                setIsAgentCreateMode(false);
                setIsAgentEditMode(true);
                setEditingAgentId(activeAgentId);
              }
            }}
            onClose={onClose}
            onAgentCreateRequested={() => {
              setIsConfigMode(false);
              setIsAgentEditMode(false);
              setEditingAgentId(null);
              setIsAgentCreateMode(true);
            }}
            onAgentEditRequested={handleEditAgent}
          />

          {showSidebarForm ? (
            <AISidebarSetup
              isConfigured={isConfigured}
              isAgentCreateMode={isAgentCreateMode}
              isAgentEditMode={isAgentEditMode}
              agentInfo={
                isAgentEditMode && editingAgentId
                  ? (() => {
                      const agent = agents.find((a) => a.id === editingAgentId);
                      if (!agent) return null;
                      return {
                        id: agent.id,
                        name: agent.name,
                        description: agent.description,
                        type: agent.type,
                        provider: agent.provider,
                        apiKey: agent.apiKey,
                        model: agent.model,
                        rules: agent.rules,
                        language: agent.language,
                        behavior: agent.behavior,
                      };
                    })()
                  : null
              }
              provider={provider}
              apiKey={apiKey}
              language={language}
              behavior={behavior}
              rules={rules}
              providerLabel={providerLabel}
              onBack={() => {
                setIsConfigMode(false);
                setIsAgentCreateMode(false);
                setIsAgentEditMode(false);
                setEditingAgentId(null);
              }}
              onSetProvider={setProvider}
              onSetApiKey={setApiKey}
              onSetLanguage={setLanguage}
              onSetBehavior={setBehavior}
              onSetRules={setRules}
              onSetupComplete={() => {
                completeSetup();
                setIsConfigMode(false);
              }}
              onAgentCreated={() => setIsAgentCreateMode(false)}
              onAgentSave={(updates) => {
                if (editingAgentId) {
                  const updateAgent = useAgentStore.getState().updateAgent;
                  updateAgent(editingAgentId, updates);
                  toast.success("Agent updated successfully");
                  setIsConfigMode(false);
                  setIsAgentCreateMode(false);
                  setIsAgentEditMode(false);
                  setEditingAgentId(null);
                }
              }}
              onResetAI={() => {
                // Reset all AI settings to defaults
                setProvider("deepseek");
                setApiKey("");
                setOpenRouterModel("openrouter/auto");
                setRules("");
                setLanguage("english");
                setBehavior("balanced");
                clearMessages();
                clearActiveAgent();
                resetSetup();
                setIsConfigMode(false);
                setIsAgentCreateMode(false);
                setIsAgentEditMode(false);
                setEditingAgentId(null);
                toast.success("AI settings reset. Please configure again.");
              }}
            />
          ) : (
            <>
              <AISidebarChat
                ref={scrollRef}
                messages={messages}
                providerLabel={providerLabel}
                savingMessageId={savingMessageId}
                copyingMessageId={copyingMessageId}
                onCopyMessage={(id, content) =>
                  void handleCopyMessage(id, content)
                }
                onSaveMessageToNote={(id, content) =>
                  void handleSaveMessageToNote(id, content)
                }
              />
              <AISidebarComposer
                draftMessage={draftMessage}
                isSubmitting={isSubmitting}
                sendHistory={sendHistory}
                provider={provider}
                apiKey={apiKey}
                openRouterModel={openRouterModel}
                isModelsOpen={isModelsOpen}
                isLoadingModels={isLoadingModels}
                modelsError={modelsError}
                availableModels={availableModels}
                errorMessage={errorMessage}
                isAgentMode={Boolean(activeAgentId)}
                onDraftChange={setDraftMessage}
                onSend={() => void handleSendMessage()}
                onToggleSendHistory={() => setSendHistory(!sendHistory)}
                onToggleModels={() => setIsModelsOpen((c) => !c)}
                onSelectModel={(model) => {
                  setOpenRouterModel(model);
                  setIsModelsOpen(false);
                }}
                onClearChat={clearMessages}
                modelsPopoverRef={modelsPopoverRef}
              />
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AISidebar;
