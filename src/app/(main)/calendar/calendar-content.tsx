"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatYYYYMMDD(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getMonthMatrix(year: number, month: number) {
  // returns array of weeks, each week is array of Date objects (7 days)
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const startDay = first.getDay() // 0..6 (Sun..Sat)
  const daysInMonth = last.getDate()

  const matrix: Date[][] = []
  let week: Date[] = []

  // previous month's tail
  const prevLast = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    week.push(new Date(year, month - 1, prevLast - i))
  }

  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) {
      matrix.push(week)
      week = []
    }
  }

  // next month head
  let nextDay = 1
  while (week.length < 7) {
    week.push(new Date(year, month + 1, nextDay++))
  }
  matrix.push(week)

  // ensure 6 rows (common calendar layout)
  while (matrix.length < 6) {
    const lastWeek = matrix[matrix.length - 1]
    const nextWeek: Date[] = []
    for (let i = 0; i < 7; i++) {
      const lastDate = lastWeek[i]
      nextWeek.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 7))
    }
    matrix.push(nextWeek)
  }

  return matrix
}

export default function CalendarContent() {
  const today = React.useMemo(() => new Date(), [])
  const [viewDate, setViewDate] = React.useState(() => startOfMonth(today))
  const [tasks, setTasks] = React.useState<any[]>([])
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const searchParams = useSearchParams()
  const [editingTask, setEditingTask] = React.useState<any | null>(null)
  const [viewOnly, setViewOnly] = React.useState(false)
  const [selectedTasks, setSelectedTasks] = React.useState<any[]>([])
  const [selectedTask, setSelectedTask] = React.useState<any | null>(null)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string>("") 
  
  const [form, setForm] = React.useState({
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
})
  
  const search = searchParams.get("search") || ""
  const monthMatrix = React.useMemo(() => getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()), [viewDate])

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goToday() {
    setViewDate(startOfMonth(today))
  }

  function openAdd(date: Date) {
  const formatted = formatYYYYMMDD(date)
  const dayTasks = eventsMap[formatted] || []

  setSelectedDate(formatted)
  setSelectedTasks(dayTasks)
  setSelectedTask(null)
  setShowAddForm(false)

  setForm({
    title: "",
    description: "",
    dueDate: formatted,
    priority: "Medium",
  })

  setSheetOpen(true)
}

  React.useEffect(() => {
  fetch("/api/tasks")
    .then(res => res.json())
    .then(data => setTasks(data))
}, [])

  const filteredTasks = React.useMemo(() => {
  if (!search.trim()) return tasks

  return tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.priority ?? "").toLowerCase().includes(search.toLowerCase())
  )
}, [tasks, search])

  const eventsMap = React.useMemo(() => {
  const map: Record<string, any[]> = {}

  filteredTasks.forEach((task) => {
    if (!task.dueDate) return

    const key = formatYYYYMMDD(new Date(task.dueDate))

    if (!map[key]) map[key] = []
    map[key].push(task)
  })

  return map
}, [filteredTasks])

  async function addEvent(e: React.FormEvent) {
  e.preventDefault()

  const todayStr = formatYYYYMMDD(new Date())

  if (form.dueDate < todayStr) {
    alert("Cannot create tasks in the past.")
    return
  }

  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...form,
      status: "todo",
    }),
  })

  const newTask = await res.json()
  setTasks((prev) => [...prev, newTask])

  setShowAddForm(false)
  setSelectedTasks(prev => [...prev, newTask])
  setForm({
    title: "",
    description: "",
    dueDate: selectedDate,
    priority: "Medium",
  })
  setSheetOpen(false)
}

  const isPastDate = selectedDate < formatYYYYMMDD(new Date())

  return (
    <div className="px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {viewDate.toLocaleString("en-US", { month: "long" })} {viewDate.getFullYear()}
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={goToday}>Today</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Desktop grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-2 text-sm text-muted-foreground mb-2">
              <div className="text-center">Sun</div>
              <div className="text-center">Mon</div>
              <div className="text-center">Tue</div>
              <div className="text-center">Wed</div>
              <div className="text-center">Thu</div>
              <div className="text-center">Fri</div>
              <div className="text-center">Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthMatrix.flat().map((day) => {
  const key = formatYYYYMMDD(day)
  const isToday = key === formatYYYYMMDD(today)
  const inMonth = day.getMonth() === viewDate.getMonth()
  const dayEvents = eventsMap[key] || []
  const isPast = key < formatYYYYMMDD(today)

  return (
    <button
      key={key}
      onClick={() => openAdd(day)}
      className={`h-28 p-2 rounded-xl border border-border text-left transition-all
        ${inMonth ? "bg-background" : "bg-muted/40 text-muted-foreground"}
        hover:shadow-sm hover:border-primary/40`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`w-8 h-8 flex items-center justify-center text-sm font-medium
          ${isToday ? "bg-primary text-primary-foreground rounded-full" : ""}`}
        >
          {day.getDate()}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {dayEvents.slice(0, 2).map((ev, i) => (
          <div
            key={i}
            className={`px-2 py-0.5 rounded-md text-xs truncate
              ${
                ev.priority === "High"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : ev.priority === "Medium"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              }`}
          >
            {ev.title}
          </div>
        ))}
        {dayEvents.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{dayEvents.length - 2} more
          </div>
        )}
      </div>
    </button>
  )
})}
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet
  open={sheetOpen}
  onOpenChange={(isOpen) => {
    setSheetOpen(isOpen)
    if (!isOpen) {
      setShowAddForm(false)
      setSelectedTask(null)
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
  <SheetContent side="right" className="w-full sm:max-w-md p-8 overflow-y-auto">
    <SheetHeader>
      <SheetTitle>
        {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </SheetTitle>
    </SheetHeader>

    {/* ✅ โหมดดูรายการ Task */}
    {!showAddForm ? (
      <div className="mt-6">
        {/* ปุ่มเพิ่ม Task */}
        {!isPastDate && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4"
          >
            + Add New Task
          </Button>
        )}

        {/* รายการ Tasks */}
        {selectedTasks.length > 0 ? (
          <div className="space-y-2 mb-4">
            <div className="text-sm font-semibold text-muted-foreground">
              Tasks ({selectedTasks.length})
            </div>
            {selectedTasks.map((task) => {
              const priorityColor =
                task.priority === "High"
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                  : task.priority === "Medium"
                  ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-green-300 bg-green-50 dark:bg-green-900/20"
            return (    
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`w-full p-3 border rounded-lg text-left hover:bg-muted transition-colors 
                  ${selectedTask?.id === task.id ? 'border-primary bg-muted' : ''}`}
              >
                <div className="font-medium text-sm">{task.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                   <span
                    className={`text-xs px-2 py-0.5 rounded
                    ${
                      task.priority === "High"
                        ? "bg-red-500 text-white"
                        : task.priority === "Medium"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                {task.priority}
                    </span>
                </div>
              </button>
            )
          })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks for this day
          </div>
        )}

        {/* รายละเอียด Task */}
        {selectedTask && (
          <div className="mt-4 p-4 border rounded-xl space-y-3 bg-muted/30">
            <div className="flex justify-between items-start">
              <div className="text-sm font-semibold">Task Details</div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Title</div>
                <div className="text-sm font-medium">{selectedTask.title}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Description</div>
                <div className="text-sm">{selectedTask.description || "No description"}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Priority</div>
                <div className="text-sm">
                  <span className={`inline-block px-2 py-1 rounded text-xs
                    ${selectedTask.priority === "High" 
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      : selectedTask.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    }`}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Due Date</div>
                <div className="text-sm">
                  {new Date(selectedTask.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      /* ✅ ฟอร์มเพิ่ม Task */
      <form onSubmit={addEvent} className="mt-6 space-y-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">New Task</h3>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Add a description..."
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={form.dueDate}
            min={new Date().toISOString().split("T")[0]}  
            onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
            className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <SheetFooter className="mt-8">
          <Button type="submit" className="w-full h-11" size="lg">
            Create Task
          </Button>
        </SheetFooter>
      </form>
    )}
  </SheetContent>
</Sheet>
    </div>
  )
}
