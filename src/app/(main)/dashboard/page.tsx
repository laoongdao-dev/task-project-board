"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { useSession } from "next-auth/react"
import { useSearchParams,useRouter } from "next/navigation"
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  GripVertical
} from "lucide-react"

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  badge,
  gradient
}: { 
  title: string
  value: React.ReactNode
  icon: any
  badge: { label: string; variant: "default" | "secondary" | "outline" }
  gradient: string
}) {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group h-36">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <CardContent className="h-full p-6 flex flex-col justify-center gap-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-10`}>
            <Icon className="h-4 w-4" />
          </div>
          <Badge variant={badge.variant} className="text-xs px-2 py-0.5">
            {badge.label}
          </Badge>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-3xl font-bold tracking-tight leading-none">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {  
  const [viewAllOpen, setViewAllOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const today = new Date()
  const [monthIndex, setMonthIndex] = React.useState(today.getMonth())
  const [year, setYear] = React.useState(today.getFullYear())
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  const search = searchParams.get("search") || ""
  
  const [tasks, setTasks] = React.useState<any[]>([])

  // Protect route
  React.useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
    }
  }, [session, status, router])

  // Fetch tasks from DB
  React.useEffect(() => {
    if (status !== "authenticated") return

    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
  }, [status])

  const filteredTasks = React.useMemo(() => {
  if (!search) return tasks

  return tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description ?? "").toLowerCase().includes(search.toLowerCase())
  )
}, [tasks, search])

  const todo = tasks.filter((t) => t.status === "todo").length
  const doing = tasks.filter((t) => t.status === "inProgress").length
  const done = tasks.filter((t) => t.status === "done").length

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, any[]>()

    tasks.forEach((task) => {
      if (!task.dueDate) return

      const d = new Date(task.dueDate)
      if (Number.isNaN(d.getTime())) return

      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

      const arr = map.get(key) ?? []
      arr.push(task)
      map.set(key, arr)
    })

    return map
  }, [tasks])


  function openDate(day: number) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(key)
    setDrawerOpen(true)
  }

  function prevMonth() {
    if (monthIndex === 0) {
      setMonthIndex(11)
      setYear(year - 1)
    } else {
      setMonthIndex(monthIndex - 1)
    }
  }

  function nextMonth() {
    if (monthIndex === 11) {
      setMonthIndex(0)
      setYear(year + 1)
    } else {
      setMonthIndex(monthIndex + 1)
    }
  }

  const upcoming = filteredTasks
    .filter((t) => t.status === "todo")
    .slice(0, 6)

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDay = new Date(year, monthIndex, 1).getDay()

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      monthIndex === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  return (
    <div className="h-full w-full px-4 lg:px-6 py-4 bg-background text-foreground">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your tasks and schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard 
          title="To Do" 
          value={todo}
          icon={ListTodo}
          badge={{ label: "Pending", variant: "outline" }}
          gradient="bg-blue-500"
        />
        <StatCard 
          title="In Progress" 
          value={doing}
          icon={Clock}
          badge={{ label: "Active", variant: "outline" }}
          gradient="bg-yellow-500"
        />
        <StatCard 
          title="Completed" 
          value={done}
          icon={CheckCircle2}
          badge={{ label: "Done", variant: "outline" }}
          gradient="bg-green-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 pt-4">
              <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewAllOpen(true)}
                className="gap-2 h-8 text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                View all
              </Button>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
              <div className="space-y-2.5">
                {upcoming.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">{search
                        ? `No tasks found for "${search}"`
                        : "No upcoming tasks"}</p>
                  </div>
                ) : (
                  upcoming.map((t) => (
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
                          window.__draggedSection = t
                        } catch (err) {
                          // ignore
                        }
                      }}
                      onDragEnd={() => {
                        try {
                          window.__draggedSection = null
                        } catch (err) {
                          // ignore
                        }
                      }}
                      className="group rounded-xl border bg-card p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start gap-2.5">
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm leading-tight">{t.title}</h4>
                            {t.priority && (
                              <Badge 
                                variant="outline" 
                                className={`
                                  text-xs shrink-0 px-2 py-0
                                  ${t.priority === 'High' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400' : ''}
                                  ${t.priority === 'Medium' ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400' : ''}
                                  ${t.priority === 'Low' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400' : ''}
                                `}
                              >
                                {t.priority}
                              </Badge>
                            )}
                          </div>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {t.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              {t.status === 'todo' ? 'To Do' : t.status === 'inProgress' ? 'In Progress' : 'Done'}
                            </Badge>
                            {t.dueDate && (
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 px-5 pt-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-4">
              <div className="space-y-3">
                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {new Date(year, monthIndex).toLocaleString("en-US", { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-0.5">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={prevMonth}
                      className="h-7 w-7"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={nextMonth}
                      className="h-7 w-7"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="rounded-lg border border-border p-2.5 bg-muted/30">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1.5">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <div 
                        key={i} 
                        className="text-xs font-semibold text-center text-muted-foreground h-6 flex items-center justify-center"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`pad-${i}`} className="h-8" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      const events = eventsByDay.get(key) ?? []
                      const hasEvents = events.length > 0
                      const todayDate = isToday(day)

                      return (
                        <button 
                          key={key} 
                          onClick={() => openDate(day)} 
                          className={`
                            h-8 rounded-lg border flex flex-col items-center justify-center
                            transition-all duration-200 text-xs font-medium
                            hover:shadow-md hover:scale-105
                            ${todayDate ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'}
                            ${hasEvents && !todayDate ? 'border-primary/50' : ''}
                          `}
                        >
                          <span className="text-xs">{day}</span>
                          {hasEvents && (
                            <div className="flex gap-0.5 mt-0.5">
                              {Array.from({ length: Math.min(events.length, 3) }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-0.5 w-0.5 rounded-full ${todayDate ? 'bg-primary-foreground' : 'bg-primary'}`} 
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 w-0.5 rounded-full bg-primary" />
                    <span>Has tasks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View All Drawer */}
      <Drawer open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DrawerContent side="right" className="w-full sm:max-w-md">
          <DrawerHeader className="border-b border-border px-5 py-4">
            <DrawerTitle className="text-lg font-semibold">All Tasks</DrawerTitle>
          </DrawerHeader>
          <div className="p-5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No tasks found</p>
              </div>
            ) : (
              filteredTasks.map((t) => (
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
                      window.__draggedSection = t
                    } catch (err) {
                      // ignore
                    }
                  }}
                  onDragEnd={() => {
                    try {
                      window.__draggedSection = null
                    } catch (err) {
                      // ignore
                    }
                  }}
                  className="group rounded-xl border bg-card p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{t.title}</h4>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {t.status === 'todo' ? 'To Do' : t.status === 'inProgress' ? 'In Progress' : 'Done'}
                        </Badge>
                        {t.priority && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {t.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <DrawerFooter className="border-t border-border px-5 py-3">
            <Button variant="outline" onClick={() => setViewAllOpen(false)} size="sm">Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Day Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent side="right" className="w-full sm:max-w-md">
          <DrawerHeader className="border-b px-5 py-4">
            <DrawerTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {selectedDate && (eventsByDay.get(selectedDate) ?? []).length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No tasks for this date</p>
              </div>
            ) : (
              (selectedDate ? (eventsByDay.get(selectedDate) ?? []) : []).map((t) => (
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
                      window.__draggedSection = t
                    } catch (err) {
                      // ignore
                    }
                  }}
                  onDragEnd={() => {
                    try {
                      window.__draggedSection = null
                    } catch (err) {
                      // ignore
                    }
                  }}
                  className="group rounded-xl border bg-card p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{t.title}</h4>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {t.status === 'todo' ? 'To Do' : t.status === 'inProgress' ? 'In Progress' : 'Done'}
                        </Badge>
                        {t.priority && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {t.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <DrawerFooter className="border-t px-5 py-3">
            <Button variant="outline" onClick={() => setDrawerOpen(false)} size="sm">Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}