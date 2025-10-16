import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  todos: Todo[];
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'todos'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'todos'>>) => void;
  deleteProject: (id: string) => void;
  addTodo: (projectId: string, todo: Omit<Todo, 'id' | 'createdAt' | 'order'>) => void;
  updateTodo: (projectId: string, todoId: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  deleteTodo: (projectId: string, todoId: string) => void;
  toggleTodoComplete: (projectId: string, todoId: string) => void;
  reorderTodos: (projectId: string, todoIds: string[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: crypto.randomUUID(),
          todos: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },
      
      addTodo: (projectId, todoData) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        
        const newTodo: Todo = {
          ...todoData,
          id: crypto.randomUUID(),
          order: project.todos.length,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, todos: [...project.todos, newTodo] }
              : project
          ),
        }));
      },
      
      updateTodo: (projectId, todoId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  todos: project.todos.map((todo) =>
                    todo.id === todoId ? { ...todo, ...updates } : todo
                  ),
                }
              : project
          ),
        }));
      },
      
      deleteTodo: (projectId, todoId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  todos: project.todos.filter((todo) => todo.id !== todoId),
                }
              : project
          ),
        }));
      },
      
      toggleTodoComplete: (projectId, todoId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  todos: project.todos.map((todo) =>
                    todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
                  ),
                }
              : project
          ),
        }));
      },
      
      reorderTodos: (projectId, todoIds) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  todos: todoIds.map((todoId, index) => {
                    const todo = project.todos.find((t) => t.id === todoId);
                    return todo ? { ...todo, order: index } : todo;
                  }).filter(Boolean) as Todo[],
                }
              : project
          ),
        }));
      },
    }),
    {
      name: "project-store",
      version: 1,
    }
  )
);
