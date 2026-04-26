"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Sidebar from "./sidebar";
import MainContent from "./main-content";

interface MuradianAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MuradianAIModal = ({
  open,
  onOpenChange,
}: MuradianAIModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 border border-border bg-background shadow-2xl rounded-3xl overflow-hidden flex flex-row">
        <Sidebar />
        <MainContent 
          query={query} 
          setQuery={setQuery} 
          inputRef={inputRef} 
        />
        <DialogTitle className="sr-only">Muradian AI - Ask Anything</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default MuradianAIModal;
