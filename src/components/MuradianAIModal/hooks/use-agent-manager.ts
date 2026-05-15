"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  type MuradianAskAgent,
  type MuradianAskAgentId,
  type MuradianAskAgentVisibility,
  useMuradianAskAgentStore,
} from "@/store/muradianAskAgentStore";

interface UseAgentManagerParams {
  open: boolean;
}

export function useAgentManager({ open }: UseAgentManagerParams) {
  const [selectedAgentId, setSelectedAgentId] = useState<MuradianAskAgentId>("");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentToDelete, setAgentToDelete] = useState<MuradianAskAgent | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<MuradianAskAgent | null>(null);
  const [isAgentEditorOpen, setIsAgentEditorOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editVisibility, setEditVisibility] = useState<MuradianAskAgentVisibility>("private");
  const [publicAgents, setPublicAgents] = useState<MuradianAskAgent[]>([]);
  const [isPublicSearchLoading, setIsPublicSearchLoading] = useState(false);
  const [isSavingAgent, setIsSavingAgent] = useState(false);

  const agents = useMuradianAskAgentStore((state) => state.agents);
  const fetchAgents = useMuradianAskAgentStore((state) => state.fetchAgents);
  const createAgent = useMuradianAskAgentStore((state) => state.createAgent);
  const updateAgent = useMuradianAskAgentStore((state) => state.updateAgent);
  const deleteAgent = useMuradianAskAgentStore((state) => state.deleteAgent);

  const selectedAgent = [...agents, ...publicAgents].find((a) => a.id === selectedAgentId);
  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.trim().toLowerCase()),
  );
  const filteredPublicAgents = publicAgents.filter(
    (a) => !agents.some((own) => own.id === a.id),
  );

  useEffect(() => {
    if (!open) return;
    setAgentSearch("");
    setPublicAgents([]);
    fetchAgents();
  }, [fetchAgents, open]);

  useEffect(() => {
    const q = agentSearch.trim();
    if (!open || q.length < 2) {
      setPublicAgents([]);
      setIsPublicSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsPublicSearchLoading(true);

    fetch(`/api/ai/agents/public?query=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : { agents: [] }))
      .then((data) => {
        setPublicAgents(
          (data.agents ?? []).map((a: Partial<MuradianAskAgent>) => ({
            ...a,
            systemInstruction: "",
            visibility: "public",
          })) as MuradianAskAgent[],
        );
      })
      .catch((err) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setPublicAgents([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPublicSearchLoading(false);
      });

    return () => controller.abort();
  }, [agentSearch, open]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "muradian-ask-agent-store") {
        useMuradianAskAgentStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!agentToEdit) {
      setEditName("");
      setEditDescription("");
      setEditRules("");
      setEditVisibility("private");
      return;
    }
    setEditName(agentToEdit.name);
    setEditDescription(agentToEdit.description);
    setEditRules(agentToEdit.systemInstruction);
    setEditVisibility(agentToEdit.visibility ?? "private");
  }, [agentToEdit]);

  const handleAddAgent = () => {
    setAgentToEdit(null);
    setEditName("");
    setEditDescription("");
    setEditRules("");
    setEditVisibility("private");
    setIsAgentEditorOpen(true);
  };

  const handleEditAgent = (agent: MuradianAskAgent) => {
    setAgentToEdit(agent);
    setIsAgentEditorOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    await deleteAgent(agentToDelete.id);
    if (selectedAgentId === agentToDelete.id) setSelectedAgentId("");
    setAgentToDelete(null);
  };

  const handleSaveAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editName.trim() || !editRules.trim()) return;
    setIsSavingAgent(true);
    try {
      if (agentToEdit) {
        await updateAgent(agentToEdit.id, {
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: editVisibility,
        });
      } else {
        const next = await createAgent({
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: editVisibility,
        });
        setSelectedAgentId(next.id);
      }
      setIsAgentEditorOpen(false);
      setAgentToEdit(null);
    } finally {
      setIsSavingAgent(false);
    }
  };

  return {
    selectedAgentId,
    setSelectedAgentId,
    agentSearch,
    setAgentSearch,
    agentToDelete,
    setAgentToDelete,
    agentToEdit,
    setAgentToEdit,
    isAgentEditorOpen,
    setIsAgentEditorOpen,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editRules,
    setEditRules,
    editVisibility,
    setEditVisibility,
    publicAgents,
    isPublicSearchLoading,
    isSavingAgent,
    agents,
    selectedAgent,
    filteredAgents,
    filteredPublicAgents,
    handleAddAgent,
    handleEditAgent,
    handleDeleteAgent,
    handleSaveAgent,
  };
}
