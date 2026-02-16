"use client"

import * as React from "react"
import { DndContext, useSensor, useSensors, PointerSensor, useDraggable, useDroppable, closestCenter } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Task = {
  id: string
  title: string
  description?: string
  assignee?: { name: string; avatar?: string; initials?: string }
  due?: string
  priority?: "High" | "Medium" | "Low"
}

const initial: Record<string, Task[]> = {
  todo: [],
  inProgress: [],
  done: [],
}

function TaskCard({ task, listeners, attributes, setNodeRef }: { task: Task; listeners?: any; attributes?: any; setNodeRef?: any }) {
  return (
    <div 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners}
      draggable
      onDragStart={(e) => {
        try {
          // Set both dataTransfer and global for maximum compatibility
          e.dataTransfer.setData(
            "application/taskboard-section",
            JSON.stringify({
              id: task.id,
              header: task.title,
              description: task.description || "",
              type: "Task",
              status: "To Do",
              target: task.due || "",
              limit: "",
              reviewer: task.assignee?.name || "Assign reviewer",
            })
          )
          e.dataTransfer.effectAllowed = "move"
          // @ts-ignore
          window.__draggedSection = {
            id: task.id,
            header: task.title,
            description: task.description || "",
            type: "Task",
            status: "To Do",
            target: task.due || "",
            limit: "",
            reviewer: task.assignee?.name || "Assign reviewer",
          }
        } catch (err) {
          // ignore
        }
      }}
      onDragEnd={(e) => {
        try {
          // @ts-ignore
          window.__draggedSection = null
          // @ts-ignore
          window.__currentDropTarget = null
        } catch (err) {
          // ignore
        }
      }}
      className="p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm group-hover:text-primary transition-colors">{task.title}</div>
          {task.description && (
            <div className="w-full text-xs text-muted-foreground mt-1 break-words line-clamp-2">
              {task.description}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 flex-1">
              <Avatar className="size-5">
                {task.assignee?.avatar ? (
                  <AvatarImage src={task.assignee.avatar} />
                ) : (
                  <AvatarFallback className="text-[10px]">{task.assignee?.initials ?? "?"}</AvatarFallback>
                )}
              </Avatar>
              <div className="truncate">{task.assignee?.name}</div>
            </div>
            {task.due && <div className="flex-shrink-0">Due {task.due}</div>}
          </div>
        </div>
        <div className="flex-shrink-0">
          <Badge 
            variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "default"}
            className="text-[10px] px-2 py-0.5"
          >
            {task.priority}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default function TaskPage() {
  const STORAGE_KEY = "taskboard:columns"

  const [columns, setColumns] = React.useState<Record<string, Task[]>>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      // ignore
    }
    return initial
  })
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ title: "", description: "", assignee: "", due: "", priority: "Medium" })
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 5,
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over) return
    const taskId = active.id
    const toColumn = over.id as string

    // find from column
    let fromColumn: string | null = null
    for (const key of Object.keys(columns)) {
      if (columns[key].find((t) => t.id === taskId)) {
        fromColumn = key
        break
      }
    }
    if (!fromColumn) return
    if (fromColumn === toColumn) return

    const task = columns[fromColumn].find((t) => t.id === taskId)
    if (!task) return

    setColumns((prev) => {
      const next = { ...prev }
      next[fromColumn!] = next[fromColumn!].filter((t) => t.id !== taskId)
      next[toColumn] = [task, ...next[toColumn]]
      return next
    })
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    const id = Date.now().toString()
    const newTask: Task = { id, title: form.title, description: form.description, assignee: { name: form.assignee, initials: form.assignee?.slice(0,1).toUpperCase() }, due: form.due, priority: form.priority as Task["priority"] }
    setColumns((prev) => ({ ...prev, todo: [newTask, ...prev.todo] }))
    setForm({ title: "", description: "", assignee: "", due: "", priority: "Medium" })
    setOpen(false)
  }

  // persist and broadcast changes to other components
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
      window.dispatchEvent(new CustomEvent('taskboard:columns', { detail: columns }))
    } catch (e) {
      // ignore
    }
  }, [columns])

  // listen for removal requests from other tables (e.g., My Tasks)
  React.useEffect(() => {
    function handler(e: Event) {
      try {
        // @ts-ignore
        const id = e?.detail?.id
        if (typeof id !== "undefined" && id !== null) {
          const idStr = String(id)
          setColumns((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(next)) {
              next[key] = next[key].filter((t) => t.id !== idStr)
            }
            return next
          })
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener("taskboard:remove-section", handler as EventListener)
    return () => window.removeEventListener("taskboard:remove-section", handler as EventListener)
  }, [])

  function handleNativeDrop(columnId: string, e: React.DragEvent) {
    e.preventDefault()
    try {
      let section = null
      
      // Try to get from dataTransfer first
      try {
        const raw = e.dataTransfer.getData("application/taskboard-section")
        if (raw) section = JSON.parse(raw)
      } catch (err) {
        // ignore
      }
      
      // Fallback to global variable if dataTransfer didn't work
      if (!section) {
        // @ts-ignore
        section = window.__draggedSection
      }
      
      if (!section) return
      
      const id = Date.now().toString()
      const newTask: Task = {
        id,
        title: section.header || section.title || "Untitled",
        assignee: { name: section.reviewer ?? "", initials: (section.reviewer ?? "").slice(0, 1).toUpperCase() },
        due: section.target ?? "",
        priority: "Medium",
      }
      setColumns((prev) => ({ ...prev, [columnId]: [newTask, ...prev[columnId]] }))
      // notify other components (e.g., DataTable) to remove the original section
      try {
        if (section?.id != null) {
          window.dispatchEvent(new CustomEvent('taskboard:remove-section', { 
            detail: { 
              id: section.id,
              header: section.header || section.title
            } 
          }))
        }
      } catch (err) {
        // ignore
      }
      // Clean up global variable
      try {
        // @ts-ignore
        window.__draggedSection = null
      } catch (err) {
        // ignore
      }
    } catch (err) {
      // ignore
    }
  }

  // fallback: listen for global mouseup and create task if a dragged section exists and a column target was hovered
  React.useEffect(() => {
    function onMouseUp() {
      try {
        // @ts-ignore
        const section = window.__draggedSection
        // @ts-ignore
        const target = window.__currentDropTarget
        if (section && target) {
          const id = Date.now().toString()
          const newTask: Task = {
            id,
            title: section.header || section.title || "Untitled",
            assignee: { name: section.reviewer ?? "", initials: (section.reviewer ?? "").slice(0, 1).toUpperCase() },
            due: section.target ?? "",
            priority: "Medium",
          }
          setColumns((prev) => ({ ...prev, [target]: [newTask, ...prev[target]] }))
          // notify removal from original table
          try {
            if (section?.id != null) {
              window.dispatchEvent(new CustomEvent('taskboard:remove-section', { 
                detail: { 
                  id: section.id,
                  header: section.header || section.title
                } 
              }))
            }
          } catch (err) {}
        }
      } catch (err) {
        // ignore
      } finally {
        try {
          // @ts-ignore
          window.__draggedSection = null
          // @ts-ignore
          window.__currentDropTarget = null
        } catch (err) {}
      }
    }

    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div className="px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Kanban Board</h2>
        <div className="flex items-center gap-2">
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button>+ Add Task</Button>
            </SheetTrigger>
            <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>New Task</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleAddTask} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                  className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
                  placeholder="Enter task description..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <Input value={form.assignee} onChange={(e) => setForm((s) => ({ ...s, assignee: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Due</label>
                <Input type="date" value={form.due} onChange={(e) => setForm((s) => ({ ...s, due: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))} className="w-full rounded-md border px-3 py-2">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <SheetFooter>
                <Button type="submit" className="w-full">Create Task</Button>
              </SheetFooter>
            </form>
          </SheetContent>
          </Sheet>
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

    <div className="bg-blue-100/60 rounded-3xl p-6">
      <Column
        id="todo"
        title="To Do"
        tasks={columns.todo}
        onNativeDrop={(e) => handleNativeDrop("todo", e)}
      />
    </div>

    <div className="bg-yellow-100/60 rounded-3xl p-6">
      <Column
        id="inProgress"
        title="Doing"
        tasks={columns.inProgress}
        onNativeDrop={(e) => handleNativeDrop("inProgress", e)}
      />
    </div>

    <div className="bg-green-100/60 rounded-3xl p-6">
      <Column
        id="done"
        title="Done"
        tasks={columns.done}
        onNativeDrop={(e) => handleNativeDrop("done", e)}
      />
    </div>
    </div>
      </DndContext>
    </div>
  )
}

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition: isDragging ? "none" : "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 0.86)"
  } : undefined
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`${isDragging ? "opacity-50 ring-2 ring-primary" : ""} transition-opacity`}
    >
      <TaskCard task={task} />
    </div>
  )
}

function Column({ id, title, tasks, onNativeDrop }: { id: string; title: string; tasks: Task[]; onNativeDrop?: (e: React.DragEvent) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const [isDragOver, setIsDragOver] = React.useState(false)
  
  const columnTitles: Record<string, string> = {
    todo: "To Do",
    inProgress: "Doing",
    done: "Done",
  }
  
  return (
    <Card className={`transition-all ${isOver || isDragOver ? "border-primary border-2 bg-primary/5 shadow-lg" : ""}`}>
      <CardHeader>
        <CardTitle className={`capitalize text-base ${isOver || isDragOver ? "text-primary font-bold" : ""}`}>
          {columnTitles[id] || title}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({tasks.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent 
        className="space-y-3"
        ref={setNodeRef}
        data-column-id={id}
        onDragOver={(e) => {
          try {
            // Check for both dataTransfer and global variable
            const hasTaskboard = e.dataTransfer.types?.includes("application/taskboard-section")
            // @ts-ignore
            const hasGlobal = window.__draggedSection != null
            if (hasTaskboard || hasGlobal) {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              setIsDragOver(true)
            }
          } catch (err) {
            // ignore
          }
          if (onNativeDrop) e.preventDefault()
        }}
        onDragLeave={() => {
          setIsDragOver(false)
          try {
            // @ts-ignore
            if (onNativeDrop) window.__currentDropTarget = null
          } catch (err) {}
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          if (onNativeDrop) onNativeDrop(e)
        }}
        onMouseEnter={() => {
          try {
            // @ts-ignore
            if (onNativeDrop) window.__currentDropTarget = id
          } catch (err) {}
        }}
        onMouseLeave={() => {
          try {
            // @ts-ignore
            if (onNativeDrop) window.__currentDropTarget = null
          } catch (err) {}
        }}
        style={{
          minHeight: "400px",
          borderRadius: "0.5rem",
          padding: "1rem",
          transition: "all 0.2s ease"
        }}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <p>Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTask key={task.id} task={task} />
          ))
        )}
      </CardContent>
    </Card>
  )
}

