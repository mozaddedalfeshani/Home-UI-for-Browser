"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { VerifyForm } from "./VerifyForm";
import { PullPrompt } from "./PullPrompt";
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudIcon } from "@hugeicons/core-free-icons";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState<string>("login");
  const [verifyEmail, setVerifyEmail] = useState<string>("");

  const handleSignupSuccess = (email: string) => {
    setVerifyEmail(email);
    setTab("verify");
  };

  const handleLoginSuccess = () => {
    setTab("pull-prompt");
  };

  const handleFinalSuccess = () => {
    onOpenChange(false);
    // Reset tab for next time
    setTimeout(() => setTab("login"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <HugeiconsIcon
              icon={CloudIcon}
              size={24}
              className="text-primary"
            />
          </div>
          <DialogTitle>LaunchTab Cloud</DialogTitle>
          <DialogDescription>
            {tab === "pull-prompt"
              ? "Finalize your sync settings"
              : "Sync your tabs and settings across all devices."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          {tab !== "verify" && tab !== "pull-prompt" && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="login">
            <LoginForm onSuccess={handleLoginSuccess} />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm onVerify={handleSignupSuccess} />
          </TabsContent>

          <TabsContent value="verify">
            <VerifyForm email={verifyEmail} onSuccess={handleLoginSuccess} />
          </TabsContent>

          <TabsContent value="pull-prompt">
            <PullPrompt onComplete={handleFinalSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
