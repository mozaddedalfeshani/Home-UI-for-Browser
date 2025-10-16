"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotepadStore } from "@/store/notepadStore";

const Notepad = () => {
  const { content, setContent, clearContent } = useNotepadStore();

  const handleClear = () => {
    clearContent();
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm border-l border-border/60">
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Notepad</h2>
          {content && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here..."
          className="h-full resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
};

export default Notepad;
