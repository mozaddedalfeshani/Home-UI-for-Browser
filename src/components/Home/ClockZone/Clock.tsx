"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import "./Clock.css";

export default function DigitalClock() {
  const [timeData, setTimeData] = useState<{ digits: string; ampm: string }>({
    digits: "",
    ampm: "",
  });
  const { clockColor, showClockGlow, clockFormat, showSeconds, clockStyle } =
    useSettingsStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let digits = "";
      let ampm = "";

      if (clockFormat === "12h") {
        const hours12 = now.getHours() % 12 || 12;
        const hours = String(hours12).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        ampm = now.getHours() >= 12 ? "PM" : "AM";

        if (showSeconds) {
          const seconds = String(now.getSeconds()).padStart(2, "0");
          digits = `${hours}:${minutes}:${seconds}`;
        } else {
          digits = `${hours}:${minutes}`;
        }
      } else {
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        if (showSeconds) {
          const seconds = String(now.getSeconds()).padStart(2, "0");
          digits = `${hours}:${minutes}:${seconds}`;
        } else {
          digits = `${hours}:${minutes}`;
        }
      }
      setTimeData({ digits, ampm });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockFormat, showSeconds]);

  return (
    <div
      className={cn(
        "clock-style text-7xl text-center flex items-baseline justify-center",
        clockStyle === "modern" ? "font-sans clock-style--modern" : "font-mono clock-style--classic"
      )}
      style={
        {
          fontFamily: clockStyle === "modern" ? "var(--font-fredoka)" : "var(--font-share-tech-mono)",
          letterSpacing: clockStyle === "modern" ? "-0.02em" : "0.02em",
          color: "var(--clock-color)",
          textShadow: showClockGlow
            ? "0 0 10px var(--glow-color), 0 0 20px var(--glow-color)"
            : "none",
          animation: showClockGlow
            ? "glow 2s ease-in-out infinite alternate"
            : "none",
          "--clock-color": clockColor,
          "--glow-color": clockColor,
          "--clock-glow-strength": showClockGlow ? "1" : "0",
        } as React.CSSProperties
      }>
      <span>{timeData.digits}</span>
      {timeData.ampm && (
        <span 
          className={cn(
            "ml-2 opacity-40 font-medium self-end mb-2",
            clockStyle === "modern" ? "text-2xl" : "text-xl font-mono"
          )}
          style={{
            fontFamily: clockStyle === "modern" ? "var(--font-fredoka)" : "var(--font-share-tech-mono)",
          }}
        >
          {timeData.ampm}
        </span>
      )}
    </div>
  );
}
