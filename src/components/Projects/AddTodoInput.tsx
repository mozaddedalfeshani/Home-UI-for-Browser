"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/projectStore";
import { Plus } from "lucide-react";

interface AddTodoInputProps {
  projectId: string;
}

export function AddTodoInput({ projectId }: AddTodoInputProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { addTodo } = useProjectStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addTodo(projectId, {
      text: text.trim(),
      completed: false,
      priority,
    });

    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
        className="px-2 py-1 text-xs border rounded bg-background"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <Button type="submit" size="sm" disabled={!text.trim()}>
        <Plus className="h-3 w-3" />
      </Button>
    </form>
  );
}
