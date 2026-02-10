"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tasks = {
  todo: [
    { id: 1, title: "Design login page" },
    { id: 2, title: "Setup database" },
  ],
  inProgress: [
    { id: 3, title: "Build dashboard layout" },
  ],
  done: [
    { id: 4, title: "Create project structure" },
  ],
}

export default function TaskPage() {
  return (
    <div className="px-4 lg:px-6 py-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Todo */}
      <Card>
        <CardHeader>
          <CardTitle>Todo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.todo.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg border bg-muted"
            >
              {task.title}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader>
          <CardTitle>In Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.inProgress.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg border bg-muted"
            >
              {task.title}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Done */}
      <Card>
        <CardHeader>
          <CardTitle>Done</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.done.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg border bg-muted"
            >
              {task.title}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  </div>
  )
}
