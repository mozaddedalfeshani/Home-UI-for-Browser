"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DeleteConfirmDialog({
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  children,
  className,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-md bg-background/80 backdrop-blur-2xl border-destructive/20 shadow-2xl",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-xl tracking-tight">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-2xl border border-destructive/10 bg-destructive/5 p-4 flex items-start gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive/80">
                Permanent Action
              </p>
              <p className="text-xs text-muted-foreground/70">
                This action cannot be undone. Please be careful.
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
            variant="destructive"
            onClick={handleConfirm}
            className="rounded-full bg-destructive hover:bg-destructive/90 font-bold px-8 shadow-lg shadow-destructive/20"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
