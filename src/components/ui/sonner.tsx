"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      position="bottom-center"
      richColors
      closeButton
      offset={24}
      toastOptions={{
        className: "rounded-2xl",
      }}
    />
  );
}
