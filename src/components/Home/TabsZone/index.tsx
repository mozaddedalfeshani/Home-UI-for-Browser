"use client";

import { Card } from "@/components/ui/card";
import { AddTabDialog } from "./AddTabDialog";
import TabsList from "./TabsList";

const TabsZone = () => {
  return (
    <section className="space-y-6">
      <Card className="rounded-3xl border border-dashed border-border/60 bg-background/60 p-6 shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-left">
            <h2 className="text-lg font-semibold text-foreground">Shortcuts</h2>
            <p className="text-sm text-muted-foreground">
              Quick access to your favorite sites
            </p>
          </div>
          <AddTabDialog />
        </div>
      </Card>
      <TabsList />
    </section>
  );
};

export default TabsZone;
