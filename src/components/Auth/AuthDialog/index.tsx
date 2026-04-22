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
import { Cloud } from "lucide-react";

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

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <Cloud className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>LaunchTab Cloud</DialogTitle>
          <DialogDescription>
            Sync your tabs and settings across all devices.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          {tab !== "verify" && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="login">
            <LoginForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm onVerify={handleSignupSuccess} />
          </TabsContent>

          <TabsContent value="verify">
            <VerifyForm email={verifyEmail} onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
