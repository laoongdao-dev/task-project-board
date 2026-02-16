"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"

type Member = {
  id: number
  name: string
  role: string
  email: string
  online: boolean
  tasks: number
  userId: string
}

const seedMembers: Member[] = [

]

export default function TeamPage() {
  const { user } = useAuth()
  const [query, setQuery] = React.useState("")
  const STORAGE_KEY = "taskboard:members"

  const [members, setMembers] = React.useState<Member[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Member[]
    } catch (e) {
      // ignore
    }
    return seedMembers
  })
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", role: "", email: "", online: true })

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
    } catch (e) {
      // ignore
    }
  }, [members])

  const filtered = React.useMemo(() => {
    // Filter by current user and search query
    const userMembers = members.filter((m) => m.userId === user?.email)
    if (!query) return userMembers
    return userMembers.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, members, user?.email])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !user?.email) return
    const id = Date.now()
    setMembers((s) => [
      { id, name: form.name, role: form.role || "Member", email: form.email, online: form.online, tasks: 0, userId: user.email },
      ...s,
    ])
    setForm({ name: "", role: "", email: "", online: true })
    setSheetOpen(false)
  }

  function handleRemove(id: number) {
    if (!confirm("ลบสมาชิกนี้ใช่หรือไม่?")) return
    setMembers((s) => s.filter((m) => m.id !== id))
  }

  return (
    <div className="px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Team Overview</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search members..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>+ Add Member</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Add New Member</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleAdd} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <Input value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.online} onCheckedChange={(v) => setForm((s) => ({ ...s, online: !!v }))} />
                  <div className="text-sm">Online</div>
                </div>
                <SheetFooter>
                  <Button type="submit" className="w-full">Create Member</Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{m.name.split(" ")[0].slice(0,1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{m.role}</TableCell>
              <TableCell>
                <Badge variant={m.online ? "secondary" : "outline"}>{m.online ? "Online" : "Offline"}</Badge>
              </TableCell>
              <TableCell>{m.tasks}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => alert(`View ${m.name}`)}>View</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleRemove(m.id)}>Remove</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
