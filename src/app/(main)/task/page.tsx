"use client"

import * as React from "react"
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { Calendar, Pencil, Trash2, Plus } from "lucide-react"

type Task = {
  id: string
  title: string
  description?: string
  status: "todo" | "inProgress" | "done"
  dueDate?: string
  priority?: "High" | "Medium" | "Low"
}

export default function TaskPage() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""

  const filteredTasks = React.useMemo(() => {
    if (!search.trim()) return tasks

    return tasks.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.priority?.toLowerCase().includes(search.toLowerCase())
    )
  }, [tasks, search])

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
  })

  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const columns = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    inProgress: filteredTasks.filter((t) => t.status === "inProgress"),
    done: filteredTasks.filter((t) => t.status === "done"),
  }

  async function fetchTasks() {
    try {
      setLoading(true)
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTasks()
  }, [])

  async function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over) return

    const taskId = String(active.id)
    const newStatus = over.id as Task["status"]

    const currentTask = tasks.find((t) => t.id === taskId)
    if (!currentTask || currentTask.status === newStatus) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentTask.title,
          description: currentTask.description,
          dueDate: currentTask.dueDate || null,
          priority: currentTask.priority,
          status: newStatus,
        }),
      })

      toast.success("Status updated")
    } catch {
      fetchTasks()
      toast.error("Failed to update")
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          dueDate: form.dueDate || null,
          priority: form.priority,
          status: "todo",
        }),
      })

      if (!res.ok) throw new Error()

      const newTask = await res.json()
      setTasks((prev) => [...prev, newTask])

      setForm({ title: "", description: "", dueDate: "", priority: "Medium" })
      setOpen(false)

      toast.success("Task created successfully")
    } catch {
      toast.error("Failed to create task")
    }
  }

  async function handleEditTask(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTask) return

    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          dueDate: form.dueDate || null,
          priority: form.priority,
          status: editingTask.status,
        }),
      })

      if (!res.ok) throw new Error()

      const updatedTask = await res.json()

      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updatedTask : t))
      )

      setEditingTask(null)
      setForm({ title: "", description: "", dueDate: "", priority: "Medium" })

      toast.success("Task updated successfully")
    } catch {
      toast.error("Failed to update task")
    }
  }

  async function handleDeleteTask() {
    if (!deletingTask) return

    try {
      const res = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id))

      setDeletingTask(null)

      toast.success("Task deleted successfully")
    } catch {
      toast.error("Failed to delete task")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full px-4 lg:px-6 xl:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Task Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your tasks efficiently
          </p>
        </div>

        <Sheet
          open={open || !!editingTask}
          onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
              setEditingTask(null)
              setForm({
                title: "",
                description: "",
                dueDate: "",
                priority: "Medium",
              })
            }
          }}
        >
          <SheetTrigger asChild>
            <Button variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-md p-8">
            <SheetHeader>
              <SheetTitle>
                {editingTask ? "Edit Task" : "New Task"}
              </SheetTitle>
            </SheetHeader>

            <form
              onSubmit={editingTask ? handleEditTask : handleAddTask}
              className="mt-6 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter task title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add a description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, dueDate: e.target.value }))
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, priority: e.target.value }))
                  }
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <SheetFooter className="mt-8">
                <Button type="submit" className="w-full h-11" size="lg">
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 auto-rows-fr">
          {(["todo", "inProgress", "done"] as const).map((col) => (
            <Column
              key={col}
              id={col}
              title={col}
              tasks={columns[col]}
              search={search}
              onEdit={(task) => {
                setEditingTask(task)
                setForm({
                  title: task.title,
                  description: task.description || "",
                  dueDate: task.dueDate || "",
                  priority: task.priority || "Medium",
                })
              }}
              onDelete={setDeletingTask}
            />
          ))}
        </div>
      </DndContext>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deletingTask}
        onOpenChange={(o) => !o && setDeletingTask(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. This will permanently delete the task.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Column({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
  search
}: {
  id: string
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  search: string
}) {
  const { setNodeRef } = useDroppable({ id })

  const columnConfig = {
    todo: {
      label: "To Do",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      badgeColor: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    },
    inProgress: {
      label: "In Progress",
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
      badgeColor: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-50/50 dark:bg-yellow-950/20",
    },
    done: {
      label: "Done",
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
      badgeColor: "bg-green-500/20 text-green-700 dark:text-green-300",
      bgColor: "bg-green-50/50 dark:bg-green-950/20",
    },
  }

  const config = columnConfig[id as keyof typeof columnConfig]

  return (
    <Card className={`rounded-2xl shadow-sm border-2 ${config.bgColor} transition-all flex flex-col h-full`}>
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base font-semibold capitalize ${config.color.split(' ')[1]}`}>
            {config.label}
          </CardTitle>
          <Badge variant="secondary" className={`${config.badgeColor} font-semibold text-xs`}>
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className="space-y-3 flex-1 overflow-y-auto px-4 pb-4 pt-2"
        style={{ 
          minHeight: '400px',
          maxHeight: 'calc(100vh - 280px)'
        }}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks yet
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function DraggableTask({
  task,
  onEdit,
  onDelete,
}: {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}) {
  const [isHovered, setIsHovered] = React.useState(false)
  
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  function formatDate(dateString?: string) {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const priorityConfig = {
    High: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    Low: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group rounded-xl border bg-card p-4 shadow-sm 
        transition-all duration-200 
        hover:shadow-md hover:-translate-y-1
        ${isDragging ? 'shadow-lg scale-105 opacity-50' : ''}
      `}
    >
      {/* Drag Area */}
      <div {...listeners} {...attributes} className="cursor-move">
        <h3 className="font-semibold text-sm leading-tight mb-2">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-border my-3" />

        {/* Metadata */}
        <div className="flex items-center justify-between gap-2">
          {task.dueDate ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          ) : (
            <div />
          )}

          {task.priority && (
            <Badge
              variant="outline"
              className={`text-xs font-medium px-2 py-0.5 ${
                priorityConfig[task.priority as keyof typeof priorityConfig]
              }`}
            >
              {task.priority}
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons - Show on hover */}
      <div
        className={`
          flex items-center gap-1 mt-3 pt-2 border-t
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          className="h-7 text-xs hover:bg-primary/10 hover:text-primary px-2"
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task)
          }}
          className="h-7 text-xs hover:bg-destructive/10 hover:text-destructive px-2"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}