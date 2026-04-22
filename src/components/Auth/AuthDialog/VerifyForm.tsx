"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function VerifyForm({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const { verify, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verify(email, code);
    if (result.success) {
      toast.success("Account verified! Welcome.");
      onSuccess();
    } else {
      toast.error(result.error || "Verification failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="text-sm text-center text-muted-foreground pb-2">
        We've sent a 4-digit code to <span className="font-medium text-foreground">{email}</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="verify-code" className="text-center block">Enter Code</Label>
        <Input
          id="verify-code"
          type="text"
          placeholder="0000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          required
          className="text-center text-2xl tracking-[10px] h-14"
          autoFocus
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || code.length !== 4}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Account"}
      </Button>
    </form>
  );
}
