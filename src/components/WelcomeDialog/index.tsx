"use client";

import { useState } from "react";
import { Code, Gamepad2, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settingsStore";
import { useTabsStore } from "@/store/tabsStore";
import { getTabsByProfile } from "@/lib/tabPresets";

interface WelcomeDialogProps {
  open: boolean;
}

export function WelcomeDialog({ open }: WelcomeDialogProps) {
  const { setHasSeenWelcome, setUserProfile } = useSettingsStore();
  const { addMultipleTabs } = useTabsStore();
  const [selectedProfile, setSelectedProfile] = useState<'developer' | 'gamer' | 'normal' | null>(null);

  const handleProfileSelect = (profile: 'developer' | 'gamer' | 'normal') => {
    setSelectedProfile(profile);
    
    // Add tabs for the selected profile
    const tabs = getTabsByProfile(profile);
    addMultipleTabs(tabs);
    
    // Update settings
    setUserProfile(profile);
    setHasSeenWelcome(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-4xl p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Welcome to MCLX</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            Let's personalize your experience
          </p>
          <p className="text-muted-foreground">
            Choose your profile to get started with relevant shortcuts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Developer Profile */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedProfile === 'developer' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleProfileSelect('developer')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Developer</CardTitle>
              <CardDescription>
                Perfect for developers with GitHub, ChatGPT, Flutter, shadcn/ui, and npm shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Includes:</p>
                <ul className="space-y-1 text-left">
                  <li>• GitHub & ChatGPT</li>
                  <li>• Flutter & shadcn/ui</li>
                  <li>• npm & Stack Overflow</li>
                  <li>• MCLX Community</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Gamer Profile */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedProfile === 'gamer' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleProfileSelect('gamer')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                <Gamepad2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Gamer</CardTitle>
              <CardDescription>
                Great for gamers with Steam, Twitch, Discord, IGN, and gaming communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Includes:</p>
                <ul className="space-y-1 text-left">
                  <li>• Steam & Twitch</li>
                  <li>• Discord & IGN</li>
                  <li>• Reddit Gaming</li>
                  <li>• MCLX Community</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Normal Profile */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedProfile === 'normal' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleProfileSelect('normal')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Normal</CardTitle>
              <CardDescription>
                Perfect for everyday use with Gmail, YouTube, Twitter, Reddit, and news
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Includes:</p>
                <ul className="space-y-1 text-left">
                  <li>• Gmail & YouTube</li>
                  <li>• Twitter & Reddit</li>
                  <li>• Google News</li>
                  <li>• MCLX Community</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Don't worry, you can always customize your shortcuts later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
