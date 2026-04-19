import type { Metadata } from "next";
import { Share_Tech_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const shareTech = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "LaunchTab - AI-Powered New Tab Dashboard",
  description:
    "A free, open-source browser start page with AI agents, shortcuts, notes, and beautiful customization. Transform your new tab into a productivity powerhouse.",
  keywords: [
    "new tab",
    "browser dashboard",
    "start page",
    "AI sidebar",
    "productivity",
    "shortcuts",
    "notes",
    "open source",
  ],
  authors: [{ name: "LaunchTab" }],
  openGraph: {
    title: "LaunchTab - AI-Powered New Tab Dashboard",
    description:
      "Transform your browser's new tab into a productivity powerhouse with AI agents, shortcuts, and notes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LaunchTab - AI-Powered New Tab Dashboard",
    description:
      "Free, open-source browser start page with AI agents and customization.",
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${shareTech.variable} ${fredoka.variable}`}>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
