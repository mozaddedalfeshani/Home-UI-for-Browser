"use client";

import { useEffect, useState } from "react";
import { Share_Tech_Mono, Orbitron } from "next/font/google";
import "./Clock.css";

const shareTech = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function DigitalClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`${shareTech.className} glow text-green-400 text-7xl font-bold tracking-widest p-8  rounded-2xl  text-center`}
      style={{
        letterSpacing: "0.1em",
      }}>
      {time}
    </div>
  );
}
