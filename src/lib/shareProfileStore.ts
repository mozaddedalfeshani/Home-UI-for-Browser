import type { Theme } from "@/store/settingsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTabsStore } from "@/store/tabsStore";
import {
  createShareProfile,
  parseShareProfile,
  type ShareProfileV1,
} from "@/lib/shareProfile";

export const exportShareProfile = (): ShareProfileV1 => {
  const tabs = useTabsStore.getState().getShareableTabs();
  const settings = useSettingsStore.getState().getShareableSettings();
  return createShareProfile(tabs, settings);
};

export const importShareProfile = (
  payload: unknown,
): {
  applied: boolean;
  theme?: Theme;
  error?: string;
  data?: ShareProfileV1;
} => {
  const { data, error } = parseShareProfile(payload);
  if (!data) {
    return { applied: false, error };
  }

  useTabsStore.getState().replaceTabsFromShareProfile(data.tabs);
  useSettingsStore.getState().applyShareProfileSettings(data.settings);

  return { applied: true, theme: data.settings.theme, data };
};
