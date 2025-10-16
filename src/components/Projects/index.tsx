"use client";

import { useProjectStore } from "@/store/projectStore";
import { ProjectCard } from "./ProjectCard";
import { AddProjectDialog } from "./AddProjectDialog";
import { FolderOpen } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

export function Projects() {
  const { projects } = useProjectStore();
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("projects")}</h2>
          <AddProjectDialog />
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t("noProjectsYet")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("createFirstProject")}
            </p>
            <AddProjectDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
