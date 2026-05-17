"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/Auth/AuthDialog/LoginForm";
import { SignupForm } from "@/components/Auth/AuthDialog/SignupForm";
import { VerifyForm } from "@/components/Auth/AuthDialog/VerifyForm";
import { PullPrompt } from "@/components/Auth/AuthDialog/PullPrompt";

interface AccountLoginSectionProps {
  onLoginComplete: () => void;
}

type AuthTab = "login" | "signup" | "verify" | "pull-prompt";

export function AccountLoginSection({
  onLoginComplete,
}: AccountLoginSectionProps) {
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [verifyEmail, setVerifyEmail] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <h3 className="text-base font-semibold text-foreground">
            LaunchTab Cloud
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {authTab === "pull-prompt"
              ? "Finalize your sync settings"
              : "Sync your tabs and settings across all devices."}
          </p>
        </div>

        {authTab !== "verify" && authTab !== "pull-prompt" && (
          <div className="flex rounded-xl border border-border/50 bg-muted/20 p-1 mb-4">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setAuthTab(tab)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors capitalize",
                  authTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {authTab === "login" && (
          <LoginForm onSuccess={() => setAuthTab("pull-prompt")} />
        )}
        {authTab === "signup" && (
          <SignupForm
            onVerify={(email) => {
              setVerifyEmail(email);
              setAuthTab("verify");
            }}
          />
        )}
        {authTab === "verify" && (
          <VerifyForm
            email={verifyEmail}
            onSuccess={() => setAuthTab("pull-prompt")}
          />
        )}
        {authTab === "pull-prompt" && (
          <PullPrompt onComplete={onLoginComplete} />
        )}
      </div>
    </div>
  );
}
