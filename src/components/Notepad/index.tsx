"use client";
import { useEffect, useState } from "react";
import {
  Trash2,
  Copy,
  FileText,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Search,
  Clock,
  Bell,
  BellRing,
  BellOff,
} from "lucide-react";
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

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

const Notepad = () => {
  const {
    notes,
    selectedNoteId,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    setNoteAlarm,
    clearNoteAlarm,
  } = useNotepadStore();
  const { language } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [alarmHours, setAlarmHours] = useState("0");
  const [alarmMinutes, setAlarmMinutes] = useState("30");
  const [alarmError, setAlarmError] = useState<string | null>(null);
  const t = useTranslation(language);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const charCount = selectedNote?.content.length || 0;
  const wordCount = selectedNote?.content.trim()
    ? selectedNote.content.trim().split(/\s+/).length
    : 0;

  const requestNotificationAccess = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // console.error("Notification permission error:", error);
      }
    }
  };

  const formatAlarmCountdown = (alarmDueAt: string | null) => {
    if (!alarmDueAt) {
      return "";
    }

    const dueAtMs = new Date(alarmDueAt).getTime();
    if (Number.isNaN(dueAtMs)) {
      return t("overdue");
    }

    const diffMs = dueAtMs - Date.now();
    if (diffMs <= 0) {
      return t("overdue");
    }

    const totalMinutes = Math.ceil(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}${t("hoursShort")} ${minutes}${t("minutesShort")}`;
    }

    if (hours > 0) {
      return `${hours}${t("hoursShort")}`;
    }

    return `${minutes}${t("minutesShort")}`;
  };

  useEffect(() => {
    if (
      !selectedNote ||
      selectedNote.alarmStatus !== "scheduled" ||
      !selectedNote.alarmDueAt
    ) {
      setAlarmHours("0");
      setAlarmMinutes("30");
      setAlarmError(null);
      return;
    }

    const remainingMs =
      new Date(selectedNote.alarmDueAt).getTime() - Date.now();
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    const nextHours = Math.floor(remainingMinutes / 60);
    const nextMinutes = remainingMinutes % 60;
    setAlarmHours(String(nextHours));
    setAlarmMinutes(String(nextMinutes));
    setAlarmError(null);
  }, [selectedNote]);

  const handleSetReminder = async () => {
    if (!selectedNote) {
      return;
    }

    const hoursValue = Number(alarmHours || "0");
    const minutesValue = Number(alarmMinutes || "0");

    if (
      !Number.isFinite(hoursValue) ||
      !Number.isFinite(minutesValue) ||
      hoursValue < 0 ||
      minutesValue < 0
    ) {
      setAlarmError(t("reminderInvalidNumbers"));
      return;
    }

    const totalMinutes = Math.round(hoursValue * 60 + minutesValue);
    if (totalMinutes < 1 || totalMinutes > 1440) {
      setAlarmError(t("reminderMax24h"));
      return;
    }

    const success = setNoteAlarm(selectedNote.id, totalMinutes);
    if (!success) {
      setAlarmError(t("reminderSetFailed"));
      return;
    }

    setAlarmError(null);
    await requestNotificationAccess();
  };

  return (
    <div className="h-full overflow-hidden flex flex-col border-l border-border/60 bg-background/78 text-foreground shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 bg-background/70 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-primary/15 bg-primary/10 p-1.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-sm font-bold uppercase tracking-tight text-foreground/90">
              {t("stickyNotes")}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-2 py-0.5 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {t("savedStatus")}
            </span>
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
                  {t("back")}
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedNote.content)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label={copied ? "Copied" : "Copy note"}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <DeleteConfirmDialog
                    title={t("deleteStickyNoteTitle")}
                    description={`${t("deleteStickyNoteDescriptionPrefix")} "${selectedNote.title || t("thisStickyNote")}"? ${t("thisActionCannotBeUndone")}`}
                    onConfirm={() => deleteNote(selectedNote.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={t("deleteStickyNoteTitle")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </DeleteConfirmDialog>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  value={selectedNote.title}
                  onChange={(e) =>
                    updateNote(selectedNote.id, { title: e.target.value })
                  }
                  placeholder={t("stickyNoteTitle")}
                  className="border-0 bg-transparent p-1 text-2xl font-bold shadow-none focus-visible:border-transparent focus-visible:ring-0 placeholder:text-muted-foreground/35"
                />
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) =>
                    updateNote(selectedNote.id, { content: e.target.value })
                  }
                  placeholder={t("writeYourNotesHere")}
                  className="h-[360px] resize-none overflow-y-auto border-0 bg-transparent p-1 text-sm leading-6 text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:border-transparent focus-visible:ring-0 selection:bg-primary/20"
                  style={{ letterSpacing: "-0.01em" }}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 bg-card/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Bell className="h-3.5 w-3.5" />
                    {t("setReminder")}
                  </div>
                  {selectedNote.alarmStatus === "scheduled" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <BellRing className="h-3 w-3" />
                      {t("scheduled")}:{" "}
                      {formatAlarmCountdown(selectedNote.alarmDueAt)}
                    </span>
                  )}
                  {selectedNote.alarmStatus === "overdue" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-300">
                      <BellRing className="h-3 w-3" />
                      {t("overdue")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      {t("hours")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      value={alarmHours}
                      onChange={(event) => setAlarmHours(event.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      {t("minutes")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={alarmMinutes}
                      onChange={(event) => setAlarmMinutes(event.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {alarmError && (
                  <p className="text-xs text-destructive">{alarmError}</p>
                )}

                <p className="text-[11px] text-muted-foreground">
                  {t("reminderMax24h")}
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8"
                    onClick={handleSetReminder}
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {t("setReminder")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => clearNoteAlarm(selectedNote.id)}
                  >
                    <BellOff className="h-3.5 w-3.5" />
                    {t("clearReminder")}
                  </Button>
                </div>
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
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {t("stickyNotes")}
                </h2>
                <Button
                  onClick={() => addNote()}
                  size="sm"
                  className="h-8 w-8 rounded-full border border-primary/15 bg-primary/10 p-0 text-primary hover:bg-primary/20"
                  aria-label="Create new note"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <Input
                  placeholder={t("searchStickyNotes")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-xl border-border/50 bg-card/65 pl-9 shadow-sm focus-visible:ring-primary/20"
                />
              </div>

              <div className="grid gap-3">
                {filteredNotes.length === 0 ? (
                  <div className="py-20 text-center opacity-40 italic text-sm">
                    {t("noStickyNotesFound")}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note.id)}
                      className="group relative w-full overflow-hidden cursor-pointer rounded-2xl border border-border/55 bg-card/60 p-4 transition-all hover:border-primary/25 hover:bg-accent/35"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 space-y-1 pr-10">
                          <h3 className="truncate text-sm font-bold transition-colors group-hover:text-primary">
                            {note.title || t("untitledStickyNote")}
                          </h3>
                          {note.alarmStatus !== "none" && (
                            <span
                              className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                                note.alarmStatus === "scheduled"
                                  ? "border border-primary/30 bg-primary/10 text-primary"
                                  : "border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                              }`}
                            >
                              <BellRing className="h-2.5 w-2.5" />
                              {note.alarmStatus === "scheduled"
                                ? `${t("scheduled")} • ${formatAlarmCountdown(note.alarmDueAt)}`
                                : t("overdue")}
                            </span>
                          )}
                        </div>
                        <DeleteConfirmDialog
                          title={t("deleteStickyNoteTitle")}
                          description={`${t("deleteStickyNoteDescriptionPrefix")} "${note.title || t("thisStickyNote")}"? ${t("thisActionCannotBeUndone")}`}
                          onConfirm={() => deleteNote(note.id)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={t("deleteStickyNoteTitle")}
                            className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DeleteConfirmDialog>
                      </div>
                      <p className="mt-2 line-clamp-2 max-w-full break-words text-xs leading-relaxed text-muted-foreground">
                        {note.content || t("noStickyContent")}
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
