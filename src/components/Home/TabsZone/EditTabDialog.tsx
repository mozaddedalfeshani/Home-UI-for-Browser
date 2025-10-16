"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTabsStore, Tab } from "@/store/tabsStore";

const normalizeUrl = (value: string) => {
  if (!value) {
    return value;
  }
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

interface EditTabDialogProps {
  tab: Tab;
  children: React.ReactNode;
}

export const EditTabDialog = ({ tab, children }: EditTabDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const updateTab = useTabsStore((state) => state.updateTab);

  // Initialize form with tab data when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(tab.title);
      setUrl(tab.url);
      setError(null);
    }
  }, [open, tab.title, tab.url]);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    const formattedUrl = normalizeUrl(trimmedUrl);

    try {
      new URL(formattedUrl);
    } catch {
      setError("Enter a valid URL.");
      return;
    }

    updateTab(tab.id, trimmedTitle, formattedUrl);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit shortcut</DialogTitle>
          <DialogDescription>
            Update your shortcut's title and destination URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="edit-shortcut-title">Title</Label>
            <Input
              id="edit-shortcut-title"
              placeholder="Design System"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-shortcut-url">URL</Label>
            <Input
              id="edit-shortcut-url"
              placeholder="https://ui.shadcn.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              inputMode="url"
              required
            />
          </div>
          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
