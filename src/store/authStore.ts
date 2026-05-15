import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTabsStore } from "./tabsStore";
import { useSettingsStore } from "./settingsStore";
import { toast } from "sonner";

type UserRole = "free" | "lite" | "plus";

interface AuthState {
  user: { email: string; id: string; name: string; role: UserRole } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastSynced: number | null;

  setUser: (user: { email: string; id: string; name: string; role?: UserRole } | null) => void;
  setLoading: (loading: boolean) => void;

  login: (
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; error?: string }>;
  verify: (
    email: string,
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  initCloudSession: () => Promise<void>;

  pushSync: () => Promise<void>;
  pullSync: (autoApply?: boolean) => Promise<void>;
}

// Module-level: unsubscribe + debounce timer for auto-sync
let tabsAutoSyncUnsub: (() => void) | null = null;
let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;

function setupAutoSync(pushSync: () => Promise<void>) {
  teardownAutoSync();
  tabsAutoSyncUnsub = useTabsStore.subscribe((state, prev) => {
    if (state.tabs === prev.tabs) return;
    if (autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => { void pushSync(); }, 2000);
  });
}

function teardownAutoSync() {
  tabsAutoSyncUnsub?.();
  tabsAutoSyncUnsub = null;
  if (autoSyncTimer) { clearTimeout(autoSyncTimer); autoSyncTimer = null; }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastSynced: null,

      setUser: (user) => set({
        user: user ? { ...user, role: user.role ?? "free" } : null,
        isAuthenticated: !!user,
      }),
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (res.ok) {
            const user = { ...data.user, role: (data.user?.role ?? "free") as UserRole };
            set({ user, isAuthenticated: true, isLoading: false });
            if (user.role === "lite" || user.role === "plus") setupAutoSync(get().pushSync);
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, error: data.error };
        } catch {
          set({ isLoading: false });
          return { success: false, error: "Network error" };
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          set({ isLoading: false });
          if (res.ok) return { success: true };
          return { success: false, error: data.error };
        } catch {
          set({ isLoading: false });
          return { success: false, error: "Network error" };
        }
      },

      verify: async (email, code) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            body: JSON.stringify({ email, code }),
          });
          const data = await res.json();
          if (res.ok) {
            const user = { ...data.user, role: (data.user?.role ?? "free") as UserRole };
            set({ user, isAuthenticated: true, isLoading: false });
            if (user.role === "lite" || user.role === "plus") setupAutoSync(get().pushSync);
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, error: data.error };
        } catch {
          set({ isLoading: false });
          return { success: false, error: "Network error" };
        }
      },

      logout: async () => {
        teardownAutoSync();
        await fetch("/api/auth/logout", { method: "POST" });
        set({ user: null, isAuthenticated: false, lastSynced: null });
      },

      fetchMe: async () => {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            const user = { ...data.user, role: (data.user?.role ?? "free") as UserRole };
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      initCloudSession: async () => {
        try {
          const res = await fetch("/api/auth/init");
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              const user = { ...data.user, role: (data.user?.role ?? "free") as UserRole };
              set({ user, isAuthenticated: true });
              if (data.data) {
                set({
                  lastSynced: data.data.updatedAt
                    ? new Date(data.data.updatedAt).getTime()
                    : Date.now(),
                });
              }
              if (user.role === "lite" || user.role === "plus") setupAutoSync(get().pushSync);
            } else {
              set({ user: null, isAuthenticated: false });
            }
          }
        } catch (error) {
          console.error("Cloud init failed:", error);
        }
      },

      pushSync: async () => {
        if (!get().isAuthenticated) return;

        const tabs = useTabsStore.getState().getShareableTabs();
        const settings = useSettingsStore.getState().getShareableSettings();

        try {
          const res = await fetch("/api/auth/sync/push", {
            method: "POST",
            body: JSON.stringify({ tabs, settings }),
          });
          if (res.ok) {
            set({ lastSynced: Date.now() });
          }
        } catch (error) {
          console.error("Failed to push sync:", error);
        }
      },

      pullSync: async (autoApply = false) => {
        if (!get().isAuthenticated) return;

        try {
          const res = await fetch("/api/auth/sync/pull");
          if (res.ok) {
            const { data } = await res.json();
            if (data) {
              if (autoApply) {
                if (data.tabs)
                  useTabsStore
                    .getState()
                    .replaceTabsFromShareProfile(data.tabs);
                if (data.settings)
                  useSettingsStore
                    .getState()
                    .applyShareProfileSettings(data.settings);
                set({
                  lastSynced: data.updatedAt
                    ? new Date(data.updatedAt).getTime()
                    : Date.now(),
                });
                toast.success("Synced with cloud");
              }
            }
          }
        } catch (error) {
          console.error("Failed to pull sync:", error);
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        lastSynced: state.lastSynced,
      }),
    },
  ),
);
