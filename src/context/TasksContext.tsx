"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface Task {
  id: string
  title: string
  assignee?: { name: string; avatar?: string; initials?: string }
  due?: string
  priority?: "High" | "Medium" | "Low"
}

export interface TasksContext {
  columns: Record<string, Task[]>
  addTask: (columnKey: string, task: Task) => void
  moveTask: (taskId: string, fromColumn: string, toColumn: string) => void
  deleteTask: (taskId: string, columnKey: string) => void
  updateTask: (taskId: string, columnKey: string, updates: Partial<Task>) => void
}

const TasksContextProvider = createContext<TasksContext | undefined>(undefined)

const initialColumns: Record<string, Task[]> = {
  todo: [
    { id: "1", title: "Design login page", assignee: { name: "Nina", initials: "N" }, due: "2026-02-20", priority: "High" },
    { id: "2", title: "Setup database", assignee: { name: "Alex", initials: "A" }, due: "2026-02-25", priority: "Medium" },
  ],
  inProgress: [
    { id: "3", title: "Build dashboard layout", assignee: { name: "Lee", initials: "L" }, due: "2026-02-18", priority: "High" },
  ],
  done: [
    { id: "4", title: "Create project structure", assignee: { name: "Sam", initials: "S" }, due: "2026-02-10", priority: "Low" },
  ],
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [columns, setColumns] = useState<Record<string, Task[]>>(initialColumns)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("taskboard:columns")
    if (stored) {
      try {
        setColumns(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored columns:", e)
      }
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage whenever columns change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("taskboard:columns", JSON.stringify(columns))
      // Dispatch custom event for other components to listen
      window.dispatchEvent(
        new CustomEvent("taskboard:columns", { detail: columns })
      )
    }
  }, [columns, isLoading])

  const addTask = (columnKey: string, task: Task) => {
    setColumns((prev) => ({
      ...prev,
      [columnKey]: [...(prev[columnKey] || []), task],
    }))
  }

  const moveTask = (taskId: string, fromColumn: string, toColumn: string) => {
    setColumns((prev) => {
      const task = prev[fromColumn]?.find((t) => t.id === taskId)
      if (!task) return prev

      return {
        ...prev,
        [fromColumn]: prev[fromColumn].filter((t) => t.id !== taskId),
        [toColumn]: [...(prev[toColumn] || []), task],
      }
    })
  }

  const deleteTask = (taskId: string, columnKey: string) => {
    setColumns((prev) => ({
      ...prev,
      [columnKey]: prev[columnKey].filter((t) => t.id !== taskId),
    }))
  }

  const updateTask = (taskId: string, columnKey: string, updates: Partial<Task>) => {
    setColumns((prev) => ({
      ...prev,
      [columnKey]: prev[columnKey].map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    }))
  }

  return (
    <TasksContextProvider.Provider
      value={{ columns, addTask, moveTask, deleteTask, updateTask }}
    >
      {children}
    </TasksContextProvider.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContextProvider)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}
