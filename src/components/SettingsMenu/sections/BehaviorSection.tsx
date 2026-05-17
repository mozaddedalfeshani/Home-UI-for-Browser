"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { ToggleRow } from "../shared/ToggleRow";

export function BehaviorSection() {
  const {
    language,
    autoOrderTabs,
    showRightSidebar,
    autoFocusSearch,
    enableLeftSidebarHover,
    enableSearchHoverZone,
    toggleAutoOrderTabs,
    toggleShowRightSidebar,
    toggleAutoFocusSearch,
    toggleLeftSidebarHover,
    toggleSearchHoverZone,
  } = useSettingsStore();
  const t = useTranslation(language);

  return (
    <div className="space-y-1">
      <ToggleRow
        label={t("autoOrderTabs")}
        checked={autoOrderTabs}
        onChange={toggleAutoOrderTabs}
      />
      <ToggleRow
        label={t("showRightSidebar")}
        checked={showRightSidebar}
        onChange={toggleShowRightSidebar}
      />
      <ToggleRow
        label={t("autoFocusSearch")}
        checked={autoFocusSearch}
        onChange={toggleAutoFocusSearch}
      />
      <ToggleRow
        label={t("enableLeftSidebarHover")}
        checked={enableLeftSidebarHover}
        onChange={toggleLeftSidebarHover}
      />
      <ToggleRow
        label={t("enableSearchHoverZone")}
        checked={enableSearchHoverZone}
        onChange={toggleSearchHoverZone}
      />
    </div>
  );
}
