"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Minus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatYYYYMMDD(d: Date) {
  return d.toISOString().slice(0, 10)
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

export default function CalendarPage() {
  const today = React.useMemo(() => new Date(), [])
  const [viewDate, setViewDate] = React.useState(() => startOfMonth(today))
  const [events, setEvents] = React.useState<Record<string, { title: string; priority?: string }[]>>(() => {
    // sample events
    const seed: Record<string, { title: string; priority?: string }[]> = {}
    const d1 = new Date()
    seed[formatYYYYMMDD(d1)] = []
    const d2 = new Date()
    d2.setDate(d2.getDate() + 2)
    seed[formatYYYYMMDD(d2)] = []
    return seed
  })

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [formTitle, setFormTitle] = React.useState("")
  const [formPriority, setFormPriority] = React.useState("Medium")

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
    setSelectedDate(formatYYYYMMDD(date))
    setFormTitle("")
    setFormPriority("Medium")
    setSheetOpen(true)
  }

  function addEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || !formTitle) return
    setEvents((prev) => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), { title: formTitle, priority: formPriority }] }))
    setSheetOpen(false)
  }

  return (
    <div className="px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {viewDate.toLocaleString("default", { month: "long" })} {viewDate.getFullYear()}
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
              {monthMatrix.map((week, wi) => (
                <div key={wi} className="space-y-2">
                  {week.map((day) => {
                    const key = formatYYYYMMDD(day)
                    const isToday = key === formatYYYYMMDD(today)
                    const inMonth = day.getMonth() === viewDate.getMonth()
                    const dayEvents = events[key] || []
                    return (
                      <button
                        key={key}
                        onClick={() => openAdd(day)}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${inMonth ? "bg-white" : "text-muted-foreground bg-background"} hover:bg-gray-50`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 flex items-center justify-center ${isToday ? "bg-foreground text-white rounded-full" : ""}`}>{day.getDate()}</div>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {dayEvents.slice(0,2).map((ev, i) => (
                            <div key={i} className={`inline-block px-2 py-0.5 rounded-full text-xs ${ev.priority === 'High' ? 'bg-red-100 text-red-800' : ev.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{ev.title}</div>
                          ))}
                          {dayEvents.length > 2 && <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: list view */}
          <div className="md:hidden">
            <div className="space-y-2">
              {monthMatrix.flat().map((day) => {
                const key = formatYYYYMMDD(day)
                const isToday = key === formatYYYYMMDD(today)
                const inMonth = day.getMonth() === viewDate.getMonth()
                const dayEvents = events[key] || []
                return (
                  <div key={key} className={`p-2 rounded-lg ${inMonth ? 'bg-white' : 'bg-background text-muted-foreground'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center ${isToday ? 'bg-foreground text-white rounded-full' : ''}`}>{day.getDate()}</div>
                        <div>
                          <div className="text-sm font-medium">{day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-muted-foreground">{dayEvents.length} events</div>
                        </div>
                      </div>
                      <div>
                        <Sheet open={sheetOpen && selectedDate === key} onOpenChange={(v) => setSheetOpen(v)}>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedDate(key); setSheetOpen(true) }}>Add</Button>
                          </SheetTrigger>
                        </Sheet>
                      </div>
                    </div>
                    <div className="mt-2 space-x-1">
                      {dayEvents.map((ev, i) => (
                        <span key={i} className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100">{ev.title}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Task Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{selectedDate ?? "New Task"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={addEvent} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className="w-full rounded-md border px-3 py-2">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <SheetFooter>
              <Button type="submit" className="w-full">Add Task</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
