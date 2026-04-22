"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "default" | "warning";
}

export function ConfirmDialog({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  open,
  onOpenChange,
  variant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md bg-background/80 backdrop-blur-2xl shadow-2xl",
          variant === "warning" ? "border-amber-500/20" : "border-primary/20",
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2 font-bold text-xl tracking-tight",
              variant === "warning" ? "text-amber-500" : "text-primary",
            )}
          >
            <HugeiconsIcon
              icon={variant === "warning" ? AlertCircleIcon : HelpCircleIcon}
              size={20}
            />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div
            className={cn(
              "rounded-2xl border p-4 flex items-start gap-3",
              variant === "warning"
                ? "border-amber-500/10 bg-amber-500/5"
                : "border-primary/10 bg-primary/5",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full",
                variant === "warning" ? "bg-amber-500/10" : "bg-primary/10",
              )}
            >
              <HugeiconsIcon
                icon={variant === "warning" ? AlertCircleIcon : HelpCircleIcon}
                size={16}
                className={
                  variant === "warning" ? "text-amber-500" : "text-primary"
                }
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  variant === "warning" ? "text-amber-600" : "text-primary/80",
                )}
              >
                {variant === "warning" ? "Sync Warning" : "Action Required"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {variant === "warning"
                  ? "This will replace your existing cloud data with your current local settings."
                  : "Please confirm to proceed with this action."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full hover:bg-muted font-semibold px-6"
            >
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            variant={variant === "warning" ? "default" : "default"}
            onClick={handleConfirm}
            className={cn(
              "rounded-full font-bold px-8 shadow-lg",
              variant === "warning"
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                : "bg-primary hover:bg-primary/90 shadow-primary/20",
            )}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
