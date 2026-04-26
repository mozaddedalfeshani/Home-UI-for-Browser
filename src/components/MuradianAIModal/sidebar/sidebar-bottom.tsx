"use client";

export const SidebarBottom = () => {
  return (
    <div className="px-4 py-6 space-y-1 border-t border-border">
      {/* User Profile - Matching requested image */}
      <div className="mt-6 pt-6 flex items-center gap-3 px-2">
        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">M</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground leading-tight">Murad</span>
          <span className="text-sm text-muted-foreground">murad@example.com</span>
        </div>
      </div>
    </div>
  );
};
