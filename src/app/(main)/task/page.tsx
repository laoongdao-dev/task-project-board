import { Suspense } from "react"
import TaskContent from "./task-content"

export const dynamic = "force-dynamic"

export default function TaskPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TaskContent />
    </Suspense>
  )
}