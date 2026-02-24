"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconBell } from '@tabler/icons-react'
import { Input } from "@/components/ui/input"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTheme } = useTheme()
  const showExtra =
  pathname === "/dashboard" ||  pathname === "/task" || pathname === "/calendar"

  const getTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/task") return "My Tasks"
    if (pathname === "/calendar") return "Calendar"
    if (pathname === "/settings") return "Settings"
    return "Dashboard"
  }

  const [search, setSearch] = React.useState(
  searchParams.get("search") || ""
)

React.useEffect(() => {
  const timeout = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }, 400)

  return () => clearTimeout(timeout)
}, [search])

function handleSearch(e: React.FormEvent) {
  e.preventDefault()

  if (pathname === "/settings") return

  const params = new URLSearchParams(searchParams.toString())

  if (search.trim()) {
    params.set("search", search.trim())
  } else {
    params.delete("search")
  }

  const query = params.toString()
  router.push(query ? `${pathname}?${query}` : pathname)
}

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b flex h-(--header-height) shrink-0 items-center gap-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        
         {/* LEFT */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">{getTitle()}</h1>
          </div>

        {/* RIGHT */}
      <div className="flex items-center gap-3 ml-auto">

        {showExtra && (
          <form onSubmit={handleSearch}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="hidden md:flex w-64"
            />
          </form>
        )}
      
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    
      </div>
      </div>
    </header>
  )
}
