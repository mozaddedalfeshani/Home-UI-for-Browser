"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useTabsStore } from "@/store/tabsStore";

const normalizeUrl = (value: string) => {
  if (!value) {
    return value;
  }
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

export const AddTabDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addTab = useTabsStore((state) => state.addTab);

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

    addTab(trimmedTitle, formattedUrl);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full border-dashed border-primary/60 bg-background text-primary shadow-none hover:border-primary">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add shortcut</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create shortcut</DialogTitle>
          <DialogDescription>
            Give your shortcut a descriptive title and the destination URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="shortcut-title">Title</Label>
            <Input
              id="shortcut-title"
              placeholder="Design System"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shortcut-url">URL</Label>
            <Input
              id="shortcut-url"
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
            <Button type="submit">Save shortcut</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
