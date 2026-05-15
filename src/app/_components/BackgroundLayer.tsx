import Image from "next/image";
import { cn } from "@/lib/utils";

interface BackgroundLayerProps {
  url: string | null | undefined;
  opacity: number;
}

export function BackgroundLayer({ url, opacity }: BackgroundLayerProps) {
  if (!url) return null;
  return (
    <Image
      src={url}
      alt="Dashboard Background"
      fill
      priority
      className={cn(
        "object-cover -z-10 transition-opacity duration-1000",
        opacity === 1 ? "opacity-100" : "opacity-0",
      )}
      unoptimized={url.startsWith("blob:")}
    />
  );
}
