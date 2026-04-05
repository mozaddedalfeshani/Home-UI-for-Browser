"use client";

import { useEffect, useState } from "react";
import { Share_Tech_Mono } from "next/font/google";
import { useSettingsStore } from "@/store/settingsStore";
import "./Clock.css";

const shareTech = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

export default function DigitalClock() {
  const [time, setTime] = useState<string>("");
  const { clockColor, showClockGlow, clockFormat, showSeconds } =
    useSettingsStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      if (clockFormat === "12h") {
        const hours12 = now.getHours() % 12 || 12;
        const hours = String(hours12).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = now.getHours() >= 12 ? "PM" : "AM";

        if (showSeconds) {
          const seconds = String(now.getSeconds()).padStart(2, "0");
          setTime(`${hours}:${minutes}:${seconds} ${ampm}`);
        } else {
          setTime(`${hours}:${minutes} ${ampm}`);
        }
      } else {
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        if (showSeconds) {
          const seconds = String(now.getSeconds()).padStart(2, "0");
          setTime(`${hours}:${minutes}:${seconds}`);
        } else {
          setTime(`${hours}:${minutes}`);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockFormat, showSeconds]);

  return (
    <div
      className={`${shareTech.className} clock-style clock-style--classic text-7xl text-center`}
      style={
        {
          letterSpacing: "0.02em",
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
      {time}
    </div>
  );
}
