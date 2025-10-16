"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProjectStore } from "@/store/projectStore";
import { Project } from "@/store/projectStore";
import { EditProjectDialog } from "./EditProjectDialog";
import { TodoList } from "./TodoList";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteProject } = useProjectStore();

  const completedTodos = project.todos.filter(todo => todo.completed).length;
  const totalTodos = project.todos.length;
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      deleteProject(project.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{project.title}</h3>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <EditProjectDialog project={project} />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completedTodos}/{totalTodos} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <TodoList projectId={project.id} todos={project.todos} />
        </CardContent>
      )}
    </Card>
  );
}
