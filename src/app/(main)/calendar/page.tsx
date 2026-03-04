"use client"

import { Suspense } from "react"
import CalendarContent from "./calendar-content"

export const dynamic = "force-dynamic"

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CalendarContent />
    </Suspense>
  )
}