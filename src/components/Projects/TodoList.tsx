"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/projectStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { Todo } from "@/store/projectStore";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { AddTodoInput } from "./AddTodoInput";

interface TodoListProps {
  projectId: string;
  todos: Todo[];
}

export function TodoList({ projectId, todos }: TodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { updateTodo, deleteTodo, toggleTodoComplete, reorderTodos } = useProjectStore();
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editingId) {
      updateTodo(projectId, editingId, { text: editText.trim() });
    }
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const moveTodo = (todoId: string, direction: 'up' | 'down') => {
    const currentIndex = sortedTodos.findIndex(t => t.id === todoId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedTodos.length) return;

    const newOrder = [...sortedTodos];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    reorderTodos(projectId, newOrder.map(t => t.id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      <AddTodoInput projectId={projectId} />
      
      {sortedTodos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("noTodosYet")}
        </p>
      ) : (
        <div className="space-y-1">
          {sortedTodos.map((todo, index) => (
            <div
              key={todo.id}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 group"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodoComplete(projectId, todo.id)}
              />
              
              <div className="flex-1 flex items-center space-x-2">
                {editingId === todo.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    className="h-6 text-sm"
                    autoFocus
                  />
                ) : (
                  <div
                    className={`flex-1 text-sm cursor-pointer ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                    onClick={() => handleEdit(todo)}
                  >
                    {todo.text}
                  </div>
                )}
                
                {todo.priority && (
                  <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveTodo(todo.id, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveTodo(todo.id, 'down')}
                  disabled={index === sortedTodos.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteTodo(projectId, todo.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
