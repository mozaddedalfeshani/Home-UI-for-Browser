"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MEMORY_LENGTH } from "@/components/Auth/AccountButton/types";
import type { MemoryResponse } from "@/components/Auth/AccountButton/types";

export function AccountMemorySection() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memory, setMemory] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/ai/memory")
      .then((r) => r.json() as Promise<MemoryResponse>)
      .then((data) => {
        const m = data.memory?.trim() ?? "";
        setMemory(m);
        setDraft(m);
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to load memory",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    const next = draft.trim();
    if (next.length > MAX_MEMORY_LENGTH) {
      toast.error(`Memory max ${MAX_MEMORY_LENGTH} chars.`);
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/ai/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memory: next }),
      });
      const data = (await res.json().catch(() => ({}))) as MemoryResponse;
      if (!res.ok) throw new Error(data.error || "Failed");
      const saved = data.memory?.trim() ?? "";
      setMemory(saved);
      setDraft(saved);
      toast.success("Memory updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading memory...</p>;
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="No memory saved yet."
        className="flex-1 min-h-[200px] resize-none rounded-xl bg-muted/30 text-sm"
        maxLength={MAX_MEMORY_LENGTH}
        disabled={isSaving}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {draft.trim().length}/{MAX_MEMORY_LENGTH}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full px-4"
            onClick={() => setDraft(memory)}
            disabled={isSaving || draft === memory}
          >
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full px-4"
            onClick={handleSave}
            disabled={isSaving || draft.trim() === memory}
          >
            {isSaving ? "Saving..." : "Save memory"}
          </Button>
        </div>
      </div>
    </div>
  );
}
