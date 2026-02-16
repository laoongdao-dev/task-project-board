import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconBell } from '@tabler/icons-react'
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  const pathname = usePathname()

  const showExtra =
  pathname === "/dashboard" || pathname === "/calendar"

  const getTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/task") return "My Tasks"
    if (pathname === "/calendar") return "Calendar"
    if (pathname === "/team") return "Team"
    if (pathname === "/settings") return "Settings"
    return "Dashboard"
  }
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b flex h-(--header-height) shrink-0 items-center gap-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getTitle()}</h1>

        {showExtra && (
        <div className="ml-auto flex items-center gap-3">
          {/* Search */}
          <Input
            placeholder="Search..."
            className="hidden md:flex w-64"
          />

          {/* Notification */}
          <Button variant="ghost" size="icon">
            <IconBell className="h-5 w-5" />
          </Button>

          {/* Profile */}
          {/* <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>LD</AvatarFallback>
          </Avatar> */}
        </div>
      )}
      </div>
    </header>
  )
}
