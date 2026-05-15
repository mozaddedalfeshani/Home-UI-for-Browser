"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSettingsStore, SearchEngine, Theme, DEFAULT_DYNAMIC_WALLPAPERS, normalizeDynamicWallpaper } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { Language, useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  PaintBrush01Icon,
  Search01Icon,
  AccountSetting01Icon,
  MagicWand01Icon,
  Share01Icon,
  Sun01Icon,
  Moon01Icon,
  ColorsIcon,
  LanguageCircleIcon,
  Image01Icon,
  Add01Icon,
  Maximize01Icon,
  Clock01Icon,
  TimeScheduleIcon,
  Download01Icon,
  Upload01Icon,
  UserIcon,
  AiBrain01Icon,
  CloudUploadIcon,
  RefreshIcon,
  Logout01Icon,
  Tick01Icon,
  RotateRight01Icon,
  Crown02Icon,
  AiNetworkIcon,
} from "@hugeicons/core-free-icons";
import { ChevronRight } from "lucide-react";

// Mobile-only section components (unchanged)
import { ThemeLanguageSection } from "./Theme/ThemeLanguageSection";
import { SearchPositionSection } from "./Search/SearchPositionSection";
import { TogglesSection } from "./Toggles/TogglesSection";
import { BackgroundSection } from "./Background/BackgroundSection";
import { ActionGrid } from "./Shortcuts/ActionGrid";

// Dialogs
import { ResizeShortcutsDialog } from "./Shortcuts/ResizeShortcutsDialog";
import { BackgroundImageDialog } from "./Background/BackgroundImageDialog";
import { ClockColorDialog } from "./Clock/ClockColorDialog";
import { HistoryDialog } from "./History/HistoryDialog";
import { ResetDialog } from "./Reset/ResetDialog";
import { ProfileDialog } from "./Profile/ProfileDialog";
import { AccountButton } from "../Auth/AccountButton";
import { LoginForm } from "../Auth/AuthDialog/LoginForm";
import { SignupForm } from "../Auth/AuthDialog/SignupForm";
import { VerifyForm } from "../Auth/AuthDialog/VerifyForm";
import { PullPrompt } from "../Auth/AuthDialog/PullPrompt";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { importShareProfile, exportShareProfile } from "@/lib/shareProfileStore";
import { parseShareProfile, type ShareProfileV1 } from "@/lib/shareProfile";
import type { MemoryResponse, ProfileResponse, TokenInfo } from "../Auth/AccountButton/types";
import { MAX_MEMORY_LENGTH, MAX_NAME_LENGTH } from "../Auth/AccountButton/types";
import { TokenUsageSection } from "../Auth/AccountButton/TokenUsageSection";

type SettingsSection =
  | "appearance" | "search" | "behavior" | "tools" | "profile-share" | "pricing" | "ai-models"
  | "account-login" | "account-profile" | "account-memory" | "account-sync";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50 group">
      <span className="text-sm text-foreground/90 group-hover:text-foreground">{label}</span>
      <div className={cn("relative h-5 w-9 rounded-full transition-colors shrink-0", checked ? "bg-primary" : "bg-muted")}>
        <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all", checked ? "translate-x-4" : "translate-x-0.5")} />
      </div>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{children}</p>;
}

const SettingsMenu = () => {
  const isDesktop = useIsDesktop();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isMobileProfileDialogOpen, setIsMobileProfileDialogOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Profile share state
  const [pendingImportProfile, setPendingImportProfile] = useState<ShareProfileV1 | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Account state
  const { user, isAuthenticated, logout, pushSync, pullSync, lastSynced, setUser } = useAuthStore();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileMemory, setProfileMemory] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [isMemorySaving, setIsMemorySaving] = useState(false);
  const [memory, setMemory] = useState("");
  const [memoryDraft, setMemoryDraft] = useState("");
  const [authTab, setAuthTab] = useState<"login" | "signup" | "verify" | "pull-prompt">("login");
  const [verifyEmail, setVerifyEmail] = useState("");

  const {
    language, theme, searchEngine, tabsPosition,
    backgroundImage, isDynamicWallpaper,
    autoOrderTabs, showRightSidebar, autoFocusSearch,
    enableLeftSidebarHover, enableSearchHoverZone,
    isClockDialogOpen, isBackgroundDialogOpen, isResizeDialogOpen,
    setTheme: setSettingsTheme, setLanguage, setSearchEngine, setTabsPosition,
    setBackgroundImage, setDynamicWallpaper,
    toggleAutoOrderTabs, toggleShowRightSidebar, toggleAutoFocusSearch,
    toggleLeftSidebarHover, toggleSearchHoverZone,
    setClockDialogOpen, setBackgroundDialogOpen, setResizeDialogOpen,
  } = useSettingsStore();

  const { setTheme } = useTheme();
  const t = useTranslation(language);

  const handleOpen = (open: boolean) => {
    setIsSettingsOpen(open);
    if (open && isAuthenticated) {
      fetch("/api/ai/usage").then((r) => r.ok ? r.json() : null).then((d: TokenInfo | null) => { if (d) setTokenInfo(d); }).catch(() => {});
    }
  };

  // Settings handlers
  const handleThemeChange = (newTheme: Theme) => { setSettingsTheme(newTheme); setTheme(newTheme); };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setDynamicWallpaper(false); setBackgroundImage(file); }
  };
  const handleWallpaperClick = async (url: string) => {
    if (backgroundImage === url && !isDynamicWallpaper) { setDynamicWallpaper(true); await setBackgroundImage(null); return; }
    setDynamicWallpaper(false); await setBackgroundImage(url);
  };

  // Profile share handlers
  const handleExportProfile = () => {
    try {
      const profile = exportShareProfile();
      const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `launchtab-profile-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { alert(t("profileExportFailed")); }
  };
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.currentTarget.value = "";
    if (!file) return;
    try {
      const { data, error } = parseShareProfile(JSON.parse(await file.text()) as unknown);
      if (!data) { alert(error ?? t("profileImportInvalid")); return; }
      setPendingImportProfile(data); setIsImportConfirmOpen(true);
    } catch { alert(t("profileImportInvalid")); }
  };
  const applyImportedProfile = () => {
    if (!pendingImportProfile) return;
    setIsImporting(true);
    try {
      const result = importShareProfile(pendingImportProfile);
      if (!result.applied) { alert(result.error ?? t("profileImportFailed")); return; }
      if (result.theme) setTheme(result.theme);
      setIsImportConfirmOpen(false); setPendingImportProfile(null);
      alert(t("profileImportSuccess"));
    } catch { alert(t("profileImportFailed")); }
    finally { setIsImporting(false); }
  };

  // Account handlers
  const loadProfile = async () => {
    setIsProfileLoading(true); setProfileName(user?.name ?? ""); setProfileMemory(""); setCurrentPassword(""); setNewPassword("");
    try {
      const res = await fetch("/api/auth/profile");
      const data = (await res.json().catch(() => ({}))) as ProfileResponse;
      if (!res.ok) throw new Error(data.error || "Failed");
      setProfileName(data.user?.name?.trim() ?? user?.name ?? ""); setProfileMemory(data.memory?.trim() ?? "");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to load profile"); }
    finally { setIsProfileLoading(false); }
  };
  const loadMemory = async () => {
    setIsMemoryLoading(true);
    try {
      const res = await fetch("/api/ai/memory");
      const data = (await res.json().catch(() => ({}))) as MemoryResponse;
      if (!res.ok) throw new Error(data.error || "Failed");
      const m = data.memory?.trim() ?? ""; setMemory(m); setMemoryDraft(m);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to load memory"); setMemory(""); setMemoryDraft(""); }
    finally { setIsMemoryLoading(false); }
  };
  const handleSectionChange = (s: SettingsSection) => {
    if (!isAuthenticated && (s === "account-profile" || s === "account-memory" || s === "account-sync")) {
      setAuthTab("login");
      setActiveSection("account-login");
      return;
    }
    setActiveSection(s);
    if (s === "account-profile" && !isProfileLoading && !profileName) void loadProfile();
    if (s === "account-memory" && !isMemoryLoading && !memory && !memoryDraft) void loadMemory();
  };
  const handleSaveProfile = async () => {
    const nextName = profileName.trim(); const nextMemory = profileMemory.trim();
    if (!nextName) { toast.error("Name is required."); return; }
    if (nextName.length > MAX_NAME_LENGTH) { toast.error(`Name max ${MAX_NAME_LENGTH} chars.`); return; }
    if (nextMemory.length > MAX_MEMORY_LENGTH) { toast.error(`Memory max ${MAX_MEMORY_LENGTH} chars.`); return; }
    setIsProfileSaving(true);
    try {
      const res = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nextName, memory: nextMemory, currentPassword, newPassword }) });
      const data = (await res.json().catch(() => ({}))) as ProfileResponse;
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.user) setUser(data.user);
      setMemory(nextMemory); setMemoryDraft(nextMemory); setCurrentPassword(""); setNewPassword("");
      toast.success("Profile updated");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setIsProfileSaving(false); }
  };
  const handleSaveMemory = async () => {
    const next = memoryDraft.trim();
    if (next.length > MAX_MEMORY_LENGTH) { toast.error(`Memory max ${MAX_MEMORY_LENGTH} chars.`); return; }
    setIsMemorySaving(true);
    try {
      const res = await fetch("/api/ai/memory", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memory: next }) });
      const data = (await res.json().catch(() => ({}))) as MemoryResponse;
      if (!res.ok) throw new Error(data.error || "Failed");
      const saved = data.memory?.trim() ?? ""; setMemory(saved); setMemoryDraft(saved);
      toast.success("Memory updated");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setIsMemorySaving(false); }
  };
  const handleLogout = async () => { setIsSettingsOpen(false); await logout(); toast.success("Logged out"); setActiveSection("appearance"); };
  const handlePushConfirm = async () => { setIsSyncing(true); await pushSync(); setIsSyncing(false); toast.success("Data synced to cloud"); };
  const handlePull = async () => { setIsSyncing(true); await pullSync(true); setIsSyncing(false); };

  const initials = user?.email?.substring(0, 2).toUpperCase() ?? "??";

  const userRole = user?.role ?? "free";
  const APP_NAV = [
    { id: "appearance" as SettingsSection, label: "Appearance", icon: PaintBrush01Icon },
    { id: "search" as SettingsSection, label: "Search & Layout", icon: Search01Icon },
    { id: "behavior" as SettingsSection, label: "Behavior", icon: AccountSetting01Icon },
    { id: "tools" as SettingsSection, label: "Tools", icon: MagicWand01Icon },
    { id: "profile-share" as SettingsSection, label: t("profileShare"), icon: Share01Icon },
    { id: "pricing" as SettingsSection, label: "Pricing", icon: Crown02Icon },
    ...(userRole === "lite" || userRole === "plus"
      ? [{ id: "ai-models" as SettingsSection, label: "AI Models", icon: AiNetworkIcon }]
      : []),
  ];

  const ACCOUNT_NAV = isAuthenticated ? [
    { id: "account-profile" as SettingsSection, label: "My Profile", icon: UserIcon },
    { id: "account-memory" as SettingsSection, label: "Memory", icon: AiBrain01Icon },
    { id: "account-sync" as SettingsSection, label: "Cloud Sync", icon: CloudUploadIcon },
  ] : [];

  const renderDesktopContent = () => {
    if (activeSection === "appearance") return (
      <div className="space-y-6">
        <div>
          <SectionLabel>{t("theme")}</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as Theme[]).map((th) => (
              <button key={th} onClick={() => handleThemeChange(th)}
                className={cn("flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all",
                  theme === th ? "border-primary bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40")}>
                <HugeiconsIcon icon={th === "light" ? Sun01Icon : th === "dark" ? Moon01Icon : ColorsIcon} size={18} strokeWidth={1.5} />
                <span className="capitalize">{t(th)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>{t("language")}</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "bn"] as Language[]).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={cn("flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                  language === lang ? "border-primary bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40")}>
                <HugeiconsIcon icon={LanguageCircleIcon} size={16} strokeWidth={1.5} />
                {lang === "en" ? "EN (English)" : "BN (বাংলা)"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>{t("backgroundImage")}</SectionLabel>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-muted/10 hover:border-primary/50 hover:bg-muted/20 transition-all">
              <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} className="text-muted-foreground" />
            </button>
            {DEFAULT_DYNAMIC_WALLPAPERS.map((wallpaper, idx) => {
              const { url, mode } = normalizeDynamicWallpaper(wallpaper);
              return (
                <button key={url} onClick={() => handleWallpaperClick(url)}
                  className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                    backgroundImage === url && !isDynamicWallpaper ? "border-primary scale-[1.05] shadow-lg" : "border-transparent opacity-60 hover:opacity-100")}>
                  <Image src={url} alt={`Wallpaper ${idx}`} width={80} height={56} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/55 px-1 text-[8px] font-semibold uppercase leading-3 text-white">
                    {mode === "both" ? "all" : mode.charAt(0)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );

    if (activeSection === "search") return (
      <div className="space-y-6">
        <div>
          <SectionLabel>{t("searchEngine")}</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {(["google", "duckduckgo", "bing"] as SearchEngine[]).map((engine) => (
              <button key={engine} onClick={() => setSearchEngine(engine)}
                className={cn("flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                  searchEngine === engine ? "border-primary bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40")}>
                <HugeiconsIcon icon={Search01Icon} size={14} strokeWidth={1.5} />
                <span className="capitalize">{engine === "duckduckgo" ? "DDG" : engine}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>{t("shortcutPosition")}</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {(["top", "center"] as const).map((pos) => (
              <button key={pos} onClick={() => setTabsPosition(pos)}
                className={cn("flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                  tabsPosition === pos ? "border-primary bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40")}>
                <HugeiconsIcon icon={Image01Icon} size={14} strokeWidth={1.5} />
                <span className="capitalize">{t(pos)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeSection === "behavior") return (
      <div className="space-y-1">
        <ToggleRow label={t("autoOrderTabs")} checked={autoOrderTabs} onChange={toggleAutoOrderTabs} />
        <ToggleRow label={t("showRightSidebar")} checked={showRightSidebar} onChange={toggleShowRightSidebar} />
        <ToggleRow label={t("autoFocusSearch")} checked={autoFocusSearch} onChange={toggleAutoFocusSearch} />
        <ToggleRow label={t("enableLeftSidebarHover")} checked={enableLeftSidebarHover} onChange={toggleLeftSidebarHover} />
        <ToggleRow label={t("enableSearchHoverZone")} checked={enableSearchHoverZone} onChange={toggleSearchHoverZone} />
        <ToggleRow label={t("dynamicWallpaper")} checked={isDynamicWallpaper} onChange={() => setDynamicWallpaper(!isDynamicWallpaper)} />
      </div>
    );

    if (activeSection === "tools") return (
      <div className="space-y-2">
        {[
          { icon: Maximize01Icon, label: t("resizeShortcuts"), onClick: () => { setResizeDialogOpen(true); setIsSettingsOpen(false); } },
          { icon: TimeScheduleIcon, label: t("history"), onClick: () => { setIsHistoryDialogOpen(true); setIsSettingsOpen(false); } },
          { icon: Clock01Icon, label: t("clockSettings"), onClick: () => { setClockDialogOpen(true); setIsSettingsOpen(false); } },
        ].map((item) => (
          <button key={item.label} onClick={item.onClick}
            className="flex w-full items-center gap-3 rounded-xl border border-border/30 bg-muted/10 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent">
            <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-left font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>
        ))}
      </div>
    );

    if (activeSection === "profile-share") return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("profileShareDescription")}</p>
        <input ref={profileFileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleExportProfile}
            className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-6 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            <HugeiconsIcon icon={Download01Icon} size={24} strokeWidth={1.5} className="text-muted-foreground" />
            {t("exportProfile")}
          </button>
          <button onClick={() => profileFileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-6 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            <HugeiconsIcon icon={Upload01Icon} size={24} strokeWidth={1.5} className="text-muted-foreground" />
            {t("importProfile")}
          </button>
        </div>
      </div>
    );

    if (activeSection === "pricing") return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Choose a plan that fits your needs.</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Lite card */}
          <div className="flex flex-col rounded-2xl border border-border/50 bg-muted/10 p-5 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Crown02Icon} size={18} strokeWidth={1.5} className="text-amber-400" />
                <span className="text-sm font-semibold text-foreground">Lite</span>
              </div>
              <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="text-base font-bold text-foreground">৳50<span className="text-xs font-normal text-muted-foreground">/mo</span></span></TooltipTrigger><TooltipContent>50 Taka per month</TooltipContent></Tooltip></TooltipProvider>
            </div>
            <ul className="flex flex-col gap-1.5 flex-1">
              {[
                "700,000 tokens / 5 hours",
                "MuradianAsk AI",
                "Notes",
                "Tab list",
                "Settings cloud sync",
              ].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Tick01Icon} size={11} className="text-amber-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full rounded-xl bg-amber-400/10 border border-amber-400/30 py-2 text-xs font-semibold text-amber-500 opacity-60 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* Plus card */}
          <div className="flex flex-col rounded-2xl border border-primary/30 bg-primary/5 p-5 gap-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
              Best
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Crown02Icon} size={18} strokeWidth={1.5} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Plus</span>
              </div>
              <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="text-base font-bold text-foreground">৳299<span className="text-xs font-normal text-muted-foreground">/mo</span></span></TooltipTrigger><TooltipContent>299 Taka per month</TooltipContent></Tooltip></TooltipProvider>
            </div>
            <ul className="flex flex-col gap-1.5 flex-1">
              {[
                "Unlimited tokens",
                "MuradianAsk AI",
                "Notes",
                "Tab list",
                "Settings cloud sync",
                "AI chat history",
                "GPT 5.5",
                "Gemini 3.1 Flash",
                "DeepSeek V4 Pro / Flash",
              ].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Tick01Icon} size={11} className="text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full rounded-xl bg-primary/10 border border-primary/30 py-2 text-xs font-semibold text-primary opacity-60 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    );

    if (activeSection === "ai-models") {
      const AI_MODELS = [
        { name: "GPT 5.5", provider: "OpenAI" },
        { name: "Gemini 3.1 Flash", provider: "Google" },
        { name: "DeepSeek V4 Pro", provider: "DeepSeek" },
        { name: "DeepSeek V4 Flash", provider: "DeepSeek" },
      ];
      const isLite = userRole === "lite";
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isLite ? "Upgrade to Plus to access multiple AI models." : "Multi-model access — coming soon."}
          </p>
          <div className="space-y-2">
            {AI_MODELS.map((model) => (
              <button
                key={model.name}
                type="button"
                onClick={() => isLite && toast.info("Please upgrade to Premium")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-sm text-foreground transition-colors",
                  isLite ? "hover:bg-accent cursor-pointer" : "cursor-not-allowed opacity-50",
                )}
              >
                <HugeiconsIcon icon={AiNetworkIcon} size={15} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.provider}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                  isLite
                    ? "bg-violet-500/10 text-violet-500 border border-violet-500/20"
                    : "bg-muted/40 text-muted-foreground border border-border/30",
                )}>
                  {isLite ? "Plus only" : "Soon"}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === "account-login") return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-sm">
          <div className="mb-5 text-center">
            <h3 className="text-base font-semibold text-foreground">LaunchTab Cloud</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {authTab === "pull-prompt" ? "Finalize your sync settings" : "Sync your tabs and settings across all devices."}
            </p>
          </div>

          {authTab !== "verify" && authTab !== "pull-prompt" && (
            <div className="flex rounded-xl border border-border/50 bg-muted/20 p-1 mb-4">
              {(["login", "signup"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setAuthTab(tab)}
                  className={cn("flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors capitalize",
                    authTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {tab === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          {authTab === "login" && (
            <LoginForm onSuccess={() => setAuthTab("pull-prompt")} />
          )}
          {authTab === "signup" && (
            <SignupForm onVerify={(email) => { setVerifyEmail(email); setAuthTab("verify"); }} />
          )}
          {authTab === "verify" && (
            <VerifyForm email={verifyEmail} onSuccess={() => setAuthTab("pull-prompt")} />
          )}
          {authTab === "pull-prompt" && (
            <PullPrompt onComplete={() => {
              setActiveSection("account-profile");
              void loadProfile();
            }} />
          )}
        </div>
      </div>
    );

    if (activeSection === "account-profile") return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          {isProfileLoading ? (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          ) : (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Display name</p>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} maxLength={MAX_NAME_LENGTH} placeholder="Your name" disabled={isProfileSaving} className="rounded-xl bg-muted/30 max-w-sm" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">MuradianAsk memory</p>
                <Textarea value={profileMemory} onChange={(e) => setProfileMemory(e.target.value)} placeholder="What should MuradianAsk remember?" className="min-h-[80px] resize-none rounded-xl bg-muted/30 text-sm max-w-sm" maxLength={MAX_MEMORY_LENGTH} disabled={isProfileSaving} />
                <p className="text-xs text-muted-foreground">{profileMemory.trim().length}/{MAX_MEMORY_LENGTH}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Change password</p>
                <div className="grid gap-2 sm:grid-cols-2 max-w-sm">
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" disabled={isProfileSaving} className="rounded-xl bg-muted/30" />
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" disabled={isProfileSaving} className="rounded-xl bg-muted/30" />
                </div>
              </div>
              <Button type="button" size="sm" className="rounded-full px-5" onClick={handleSaveProfile} disabled={isProfileSaving}>
                {isProfileSaving ? "Saving..." : "Save profile"}
              </Button>
            </>
          )}
        </div>
      </div>
    );

    if (activeSection === "account-memory") return (
      <div className="flex flex-col h-full space-y-3">
        {isMemoryLoading ? (
          <p className="text-sm text-muted-foreground">Loading memory...</p>
        ) : (
          <>
            <Textarea value={memoryDraft} onChange={(e) => setMemoryDraft(e.target.value)} placeholder="No memory saved yet." className="flex-1 min-h-[200px] resize-none rounded-xl bg-muted/30 text-sm" maxLength={MAX_MEMORY_LENGTH} disabled={isMemorySaving} />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{memoryDraft.trim().length}/{MAX_MEMORY_LENGTH}</p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full px-4" onClick={() => setMemoryDraft(memory)} disabled={isMemorySaving || memoryDraft === memory}>Reset</Button>
                <Button type="button" size="sm" className="rounded-full px-4" onClick={handleSaveMemory} disabled={isMemorySaving || memoryDraft.trim() === memory}>
                  {isMemorySaving ? "Saving..." : "Save memory"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );

    if (activeSection === "account-sync") return (
      <div className="space-y-4">
        {tokenInfo && (
          <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
            <TokenUsageSection tokenInfo={tokenInfo} />
          </div>
        )}
        <div className="space-y-2">
          <SectionLabel>Sync data</SectionLabel>
          {[
            { icon: CloudUploadIcon, title: "Push local to cloud", desc: "Overwrite cloud with current local data", onClick: () => setIsPushConfirmOpen(true) },
            { icon: RefreshIcon, title: "Pull from cloud", desc: "Replace local data with cloud version", onClick: handlePull },
          ].map((item) => (
            <button key={item.title} onClick={item.onClick} disabled={isSyncing}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-muted/10 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50">
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {lastSynced && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Tick01Icon} size={12} className="text-green-500" />
            Last synced {new Date(lastSynced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {isDesktop ? (
        <>
          <Button variant="outline" size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
            aria-label="Settings" onClick={() => handleOpen(true)}>
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={handleOpen}>
            <DialogContent hideDefaultClose className={cn(
              "p-0 overflow-hidden rounded-2xl w-full sm:max-w-3xl sm:h-[520px]",
              user?.role === "plus" && "border-violet-500/60",
              user?.role === "lite" && "border-amber-400/60",
            )}>
              <DialogTitle className="sr-only">{t("settings")}</DialogTitle>

              <div className="flex h-full overflow-hidden">
                {/* Left sidebar */}
                <div className="flex flex-col w-52 shrink-0 border-r border-border/20 bg-muted/20">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/20">
                    <span className="text-sm font-semibold text-foreground">{t("settings")}</span>
                    <ResetDialog>
                      <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-destructive hover:bg-destructive/10" aria-label="Reset settings">
                        <HugeiconsIcon icon={RotateRight01Icon} size={12} strokeWidth={1.5} />
                      </Button>
                    </ResetDialog>
                  </div>

                  <nav className="flex-1 overflow-y-auto py-2">
                    {/* App settings */}
                    {APP_NAV.map((item) => (
                      <button key={item.id} type="button" onClick={() => handleSectionChange(item.id)}
                        className={cn("flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                          activeSection === item.id ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
                        <HugeiconsIcon icon={item.icon} size={15} strokeWidth={1.5} className="shrink-0 opacity-80" />
                        {item.label}
                      </button>
                    ))}

                    {/* Account section — always shown */}
                    <div className="mx-4 my-2 border-t border-border/20" />
                    <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Account</p>

                    {!isAuthenticated && (
                      <button type="button" onClick={() => handleSectionChange("account-login")}
                        className={cn("flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                          activeSection === "account-login" ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
                        <HugeiconsIcon icon={UserIcon} size={15} strokeWidth={1.5} className="shrink-0 opacity-80" />
                        Sign in
                      </button>
                    )}

                    {[
                      { id: "account-profile" as SettingsSection, label: "My Profile", icon: UserIcon },
                      { id: "account-memory" as SettingsSection, label: "Memory", icon: AiBrain01Icon },
                      { id: "account-sync" as SettingsSection, label: "Cloud Sync", icon: CloudUploadIcon },
                    ].map((item) => (
                      <button key={item.id} type="button" onClick={() => handleSectionChange(item.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                          !isAuthenticated && "opacity-40 cursor-not-allowed",
                          activeSection === item.id ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        )}>
                        <HugeiconsIcon icon={item.icon} size={15} strokeWidth={1.5} className="shrink-0 opacity-80" />
                        {item.label}
                      </button>
                    ))}

                    {isAuthenticated && (
                      <button type="button" onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-accent/60 transition-colors">
                        <HugeiconsIcon icon={Logout01Icon} size={15} strokeWidth={1.5} className="shrink-0" />
                        Log out
                      </button>
                    )}
                  </nav>

                  {/* User info footer */}
                  {isAuthenticated && (
                    <div className="border-t border-border/20 px-4 py-3">
                      <p className="text-xs font-medium text-foreground truncate">{user?.name || "Account"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  )}
                </div>

                {/* Right content panel */}
                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-border/20 shrink-0">
                    <h2 className="text-sm font-semibold text-foreground">
                      {[...APP_NAV, ...ACCOUNT_NAV].find((n) => n.id === activeSection)?.label
                        ?? (activeSection === "account-sync" ? "Cloud Sync"
                          : activeSection === "ai-models" ? "AI Models"
                          : activeSection === "account-login" ? "Sign In"
                          : activeSection === "account-profile" ? "My Profile"
                          : activeSection === "account-memory" ? "Memory"
                          : "")}
                    </h2>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                    {renderDesktopContent()}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        /* Mobile: unchanged DropdownMenu */
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
              aria-label="Settings">
              <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("settings")}</span>
              <div className="flex items-center gap-1">
                <AccountButton />
                <ResetDialog>
                  <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-destructive hover:bg-destructive/10" aria-label="Reset settings">
                    <HugeiconsIcon icon={RotateRight01Icon} size={12} strokeWidth={1.5} />
                  </Button>
                </ResetDialog>
              </div>
            </div>
            <DropdownMenuSeparator />
            <ThemeLanguageSection />
            <DropdownMenuSeparator />
            <SearchPositionSection />
            <DropdownMenuSeparator />
            <TogglesSection showMore={showMore} setShowMore={setShowMore} />
            <DropdownMenuSeparator />
            <BackgroundSection />
            {showMore && (
              <>
                <DropdownMenuSeparator />
                <ActionGrid
                  onResizeClick={() => setResizeDialogOpen(true)}
                  onHistoryClick={() => setIsHistoryDialogOpen(true)}
                  onClockClick={() => setClockDialogOpen(true)}
                  onProfileClick={() => setIsMobileProfileDialogOpen(true)}
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ResizeShortcutsDialog open={isResizeDialogOpen} onOpenChange={setResizeDialogOpen} />
      <BackgroundImageDialog open={isBackgroundDialogOpen} onOpenChange={setBackgroundDialogOpen} />
      <ClockColorDialog open={isClockDialogOpen} onOpenChange={setClockDialogOpen} />
      <HistoryDialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen} />
      <ProfileDialog open={isMobileProfileDialogOpen} onOpenChange={setIsMobileProfileDialogOpen} />

      <Dialog open={isImportConfirmOpen} onOpenChange={(open) => { setIsImportConfirmOpen(open); if (!open) setPendingImportProfile(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{t("importProfileConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("importProfileConfirmDescription")}</DialogDescription>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setIsImportConfirmOpen(false); setPendingImportProfile(null); }} disabled={isImporting}>{t("cancel")}</Button>
            <Button onClick={applyImportedProfile} disabled={isImporting}>{isImporting ? t("loading") : t("importProfile")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isPushConfirmOpen}
        onOpenChange={setIsPushConfirmOpen}
        title="Sync to Cloud?"
        description="This will overwrite your cloud data with current local tabs and settings."
        confirmText="Yes, Sync Now"
        variant="warning"
        onConfirm={handlePushConfirm}
      />

      {lastSynced && (
        <div className="hidden md:flex items-center text-[10px] text-muted-foreground gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
          <HugeiconsIcon icon={Tick01Icon} size={12} className="text-green-500" />
          <span>Synced</span>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
