"use client";

import {
  Dialog,
  DialogContentBottom,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentForm } from "../AgentForm";

interface AgentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentSheet({ open, onOpenChange }: AgentSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentBottom className="w-full border-border/60 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl sm:bottom-6 sm:max-w-2xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
          <DialogDescription>
            Save a standalone agent profile with its own provider, model, API
            key, rules, language, and behavior.
          </DialogDescription>
        </DialogHeader>
        <AgentForm onCreated={() => onOpenChange(false)} />
      </DialogContentBottom>
    </Dialog>
  );
}
