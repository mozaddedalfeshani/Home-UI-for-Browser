"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotepadStore } from "@/store/notepadStore";
import { Projects } from "@/components/Projects";

const Notepad = () => {
  const { content, setContent, clearContent } = useNotepadStore();
  const [activeTab, setActiveTab] = useState("notes");

  const handleClear = () => {
    clearContent();
  };

  return (
    <div className="h-full overflow-hidden border  max-h-screen flex flex-col bg-background/50 backdrop-blur-sm border-l border-border/60">
      <div className="overflow-y-auto h-full">
      <div className="p-4 border-b border-border/60">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="notes" className="h-full m-0">
            <div className="h-full flex flex-col">
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
          </TabsContent>
          
          <TabsContent value="projects" className="h-full m-0">
            <Projects />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notepad;
