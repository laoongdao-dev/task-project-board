"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer"
import data from "./data.json"

function StatCard({ title, value, children }: { title: string; value: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-2xl font-semibold mt-2">{value}</div>
      </CardHeader>
      <CardFooter className="pt-2 text-sm">{children}</CardFooter>
    </Card>
  )
}

export default function Page() {
  const [viewAllOpen, setViewAllOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [monthIndex, setMonthIndex] = React.useState(2) // March (0-based)
  const [year, setYear] = React.useState(2021)

  const STORAGE_KEY = "taskboard:columns"

  // tasks state: prefer Kanban columns from localStorage (live), fallback to data.json
  const [tasks, setTasks] = React.useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const cols = JSON.parse(raw) as Record<string, any[]>
        return Object.entries(cols).flatMap(([key, items]) =>
          items.map((it) => ({
            id: it.id,
            header: it.title,
            type: "Task",
            status: key === "todo" ? "Not Started" : key === "inProgress" ? "In Progress" : "Done",
            target: it.due ?? "",
            limit: "",
            reviewer: it.assignee?.name ?? "",
          }))
        )
      }
    } catch (e) {
      // ignore
    }
    return data
  })

  // listen for updates dispatched by Kanban
  React.useEffect(() => {
    function handler(e: Event) {
      try {
        // event detail may be the columns object
        // @ts-ignore
        const cols = e?.detail as Record<string, any[]> | undefined
        if (cols) {
          const flat = Object.entries(cols).flatMap(([key, items]) =>
            items.map((it) => ({
              id: it.id,
              header: it.title,
              type: "Task",
              status: key === "todo" ? "Not Started" : key === "inProgress" ? "In Progress" : "Done",
              target: it.due ?? "",
              limit: "",
              reviewer: it.assignee?.name ?? "",
            }))
          )
          setTasks(flat)
          return
        }
      } catch (e) {
        // ignore
      }
      // fallback: read from localStorage
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const cols = JSON.parse(raw)
          const flat = Object.entries(cols).flatMap(([key, items]) =>
            items.map((it) => ({
              id: it.id,
              header: it.title,
              type: "Task",
              status: key === "todo" ? "Not Started" : key === "inProgress" ? "In Progress" : "Done",
              target: it.due ?? "",
              limit: "",
              reviewer: it.assignee?.name ?? "",
            }))
          )
          setTasks(flat)
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('taskboard:columns', handler as EventListener)
    return () => window.removeEventListener('taskboard:columns', handler as EventListener)
  }, [])

  // derive counts from tasks
  const todo = tasks.filter((d) => d.status?.toLowerCase().includes("not started")).length
  const doing = tasks.filter((d) => d.status?.toLowerCase().includes("doing") || d.status?.toLowerCase().includes("in progress")).length
  const done = tasks.filter((d) => d.status?.toLowerCase().includes("done")).length

  // build eventsByDay (use target date when present)
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, (typeof tasks)[number][]>()
    tasks.forEach((item) => {
      let day = 1
      if (item.target) {
        const d = new Date(item.target)
        if (!Number.isNaN(d.getTime())) day = d.getDate()
        else day = (Number(item.id) % 28) + 1
      } else {
        day = (Number(item.id) % 28) + 1
      }
      const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    })
    return map
  }, [tasks, monthIndex, year])

  function openDate(day: number) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(key)
    setDrawerOpen(true)
  }

  const upcoming = tasks
    .filter((t) => t.status?.toLowerCase().includes("not started"))
    .slice(0, 6)

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDay = new Date(year, monthIndex, 1).getDay()

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="To Do" value={todo}>
          <Badge variant="outline">Pending</Badge>
        </StatCard>
        <StatCard title="Doing" value={doing}>
          <Badge variant="outline">In Progress</Badge>
        </StatCard>
        <StatCard title="Done" value={done}>
          <Badge variant="outline">Completed</Badge>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Upcoming Task</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setViewAllOpen(true)}>View all</Button>
              </div>
            </CardHeader>
            <div className="p-4">
              <div className="space-y-2">
                {upcoming.map((t) => (
                  <div 
                    key={t.id} 
                    draggable
                    onDragStart={(e) => {
                      try {
                        e.dataTransfer.setData(
                          "application/taskboard-section",
                          JSON.stringify(t)
                        )
                        e.dataTransfer.effectAllowed = "move"
                        // @ts-ignore
                        window.__draggedSection = t
                      } catch (err) {
                        // ignore
                      }
                    }}
                    onDragEnd={() => {
                      try {
                        // @ts-ignore
                        window.__draggedSection = null
                      } catch (err) {
                        // ignore
                      }
                    }}
                    className="rounded-lg border bg-background p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t.header}</div>
                      <div className="text-sm text-muted-foreground">{t.target}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{t.type} — {t.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="w-full rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium">{new Date(year, monthIndex).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setMonthIndex((m) => m - 1)}>-</Button>
                    <Button variant="ghost" size="icon" onClick={() => setMonthIndex((m) => m + 1)}>+</Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                    <div key={d} className="font-medium">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 mt-2 text-sm">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const events = eventsByDay.get(key) ?? []
                    return (
                      <button key={key} onClick={() => openDate(day)} className="h-8 rounded-md border flex flex-col items-center justify-center">
                        <div className="text-sm">{day}</div>
                        {events.length > 0 ? <div className="text-[10px] text-muted-foreground">{events.length} item(s)</div> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* View All Drawer */}
      <Drawer open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>All Tasks</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            {tasks.map((t) => (
              <div 
                key={t.id} 
                draggable
                onDragStart={(e) => {
                  try {
                    e.dataTransfer.setData(
                      "application/taskboard-section",
                      JSON.stringify(t)
                    )
                    e.dataTransfer.effectAllowed = "move"
                    // @ts-ignore
                    window.__draggedSection = t
                  } catch (err) {
                    // ignore
                  }
                }}
                onDragEnd={() => {
                  try {
                    // @ts-ignore
                    window.__draggedSection = null
                  } catch (err) {
                    // ignore
                  }
                }}
                className="rounded-md border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
              >
                <div className="font-medium">{t.header}</div>
                <div className="text-sm text-muted-foreground">{t.type} — {t.status}</div>
              </div>
            ))}
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setViewAllOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Day Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>{selectedDate}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            {(selectedDate ? (eventsByDay.get(selectedDate) ?? []) : []).map((t) => (
              <div 
                key={t.id} 
                draggable
                onDragStart={(e) => {
                  try {
                    e.dataTransfer.setData(
                      "application/taskboard-section",
                      JSON.stringify(t)
                    )
                    e.dataTransfer.effectAllowed = "move"
                    // @ts-ignore
                    window.__draggedSection = t
                  } catch (err) {
                    // ignore
                  }
                }}
                onDragEnd={() => {
                  try {
                    // @ts-ignore
                    window.__draggedSection = null
                  } catch (err) {
                    // ignore
                  }
                }}
                className="rounded-md border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
              >
                <div className="font-medium">{t.header}</div>
                <div className="text-sm text-muted-foreground">{t.type} — {t.status}</div>
              </div>
            ))}
            {selectedDate && (eventsByDay.get(selectedDate) ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No tasks for this date.</div>
            ) : null}
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
