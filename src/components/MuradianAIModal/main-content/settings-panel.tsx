"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Zap } from "lucide-react";

export function SettingsPanel() {
  const { user } = useAuthStore();
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [tokenLimit, setTokenLimit] = useState<number>(100000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/ai/usage");
        if (res.ok) {
          const data = await res.json();
          setTokensUsed(data.tokensUsed);
          setTokenLimit(data.tokenLimit);
        }
      } catch (error) {
        console.error("Failed to fetch token usage", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const progressPercentage =
    tokensUsed !== null ? Math.min((tokensUsed / tokenLimit) * 100, 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Settings & Usage
          </h1>
          <p className="text-muted-foreground">
            Manage your AI capabilities and track monthly limits.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border-emerald-500/20 shadow-sm bg-gradient-to-br from-background to-emerald-50/30 dark:to-emerald-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    AI Token Usage
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Your monthly allowance for Muradian AI interactions.
                  </CardDescription>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold tracking-tighter">
                        {tokensUsed?.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-2 text-sm font-medium">
                        / {tokenLimit.toLocaleString()} tokens
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                      {progressPercentage.toFixed(1)}% Used
                    </span>
                  </div>

                  <Progress
                    value={progressPercentage}
                    className="h-3 bg-zinc-200 dark:bg-zinc-800"
                    indicatorClassName={
                      progressPercentage > 90
                        ? "bg-destructive"
                        : progressPercentage > 75
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    This quota resets automatically on the first day of every
                    month. Input prompts and generated responses both consume
                    tokens.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Account Profile</CardTitle>
              <CardDescription>
                The current logged-in identity tied to your usage data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl uppercase">
                      {user?.name ? user.name[0] : user?.email?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg leading-none capitalize mb-1.5">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
