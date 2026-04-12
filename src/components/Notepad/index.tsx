"use client";
import { useState } from "react";
import { Trash2, Copy, FileText, CheckCircle2, Plus, ArrowLeft, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNotepadStore } from "@/store/notepadStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

const Notepad = () => {
  const { notes, selectedNoteId, addNote, updateNote, deleteNote, selectNote } = useNotepadStore();
  const { language } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const t = useTranslation(language);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const charCount = selectedNote?.content.length || 0;
  const wordCount = selectedNote?.content.trim() ? selectedNote.content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full overflow-hidden flex flex-col border-l border-border/60 bg-background/78 text-foreground shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 bg-background/70 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-primary/15 bg-primary/10 p-1.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-sm font-bold uppercase tracking-tight text-foreground/90">{t("notes")}</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-2 py-0.5 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Saved</span>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="h-full flex flex-col min-h-0">
          {selectedNote ? (
            /* Editor View */
            <div className="flex-1 flex flex-col p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectNote(null)}
                  className="h-8 gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedNote.content)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <DeleteConfirmDialog
                    title="Delete Note?"
                    description={`Are you sure you want to delete "${selectedNote.title || 'this note'}"? This cannot be undone.`}
                    onConfirm={() => deleteNote(selectedNote.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </DeleteConfirmDialog>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  placeholder="Note Title"
                  className="border-0 bg-transparent p-1 text-2xl font-bold shadow-none focus-visible:border-transparent focus-visible:ring-0 placeholder:text-muted-foreground/35"
                />
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                  placeholder={t("writeYourNotesHere")}
                  className="min-h-[400px] flex-1 resize-none border-0 bg-transparent p-1 text-lg leading-relaxed text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:border-transparent focus-visible:ring-0 selection:bg-primary/20"
                  style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}
                />
              </div>

              {/* Editor Footer */}
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/10">
                <div className="flex gap-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  <span>{charCount} Characters</span>
                  <span>{wordCount} Words</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(selectedNote.updatedAt)}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="p-6 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">My Stack</h2>
                <Button 
                  onClick={() => addNote()} 
                  size="sm" 
                  className="h-8 w-8 rounded-full border border-primary/15 bg-primary/10 p-0 text-primary hover:bg-primary/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <Input 
                  placeholder="Search notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-xl border-border/50 bg-card/65 pl-9 shadow-sm focus-visible:ring-primary/20"
                />
              </div>

              <div className="grid gap-3">
                {filteredNotes.length === 0 ? (
                  <div className="py-20 text-center opacity-40 italic text-sm">
                    No notes found
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note.id)}
                      className="group relative cursor-pointer rounded-2xl border border-border/55 bg-card/60 p-4 transition-all hover:border-primary/25 hover:bg-accent/35"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-sm truncate pr-6 group-hover:text-primary transition-colors">
                          {note.title || "Untitled Note"}
                        </h3>
                        <DeleteConfirmDialog
                          title="Delete Note?"
                          description={`Are you sure you want to delete "${note.title || 'this note'}"? This cannot be undone.`}
                          onConfirm={() => deleteNote(note.id)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DeleteConfirmDialog>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {note.content || "No content..."}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/85">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(note.updatedAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notepad;
