import { Suspense } from "react"
import DashboardContent from "./dashboard-content"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}