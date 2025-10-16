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
  const { clockColor, showClockGlow, clockFormat, showSeconds } = useSettingsStore();

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
      className={`${shareTech.className} text-7xl font-bold tracking-widest p-8 rounded-2xl text-center ${
        showClockGlow ? 'glow' : ''
      }`}
      style={{
        letterSpacing: "0.1em",
        color: clockColor,
        textShadow: showClockGlow ? `0 0 10px ${clockColor}, 0 0 20px ${clockColor}` : 'none',
        animation: showClockGlow ? `glow 2s ease-in-out infinite alternate` : 'none',
        '--glow-color': clockColor,
      } as React.CSSProperties}>
      {time}
    </div>
  );
}
