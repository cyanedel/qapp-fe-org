import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Home, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Settings, User as UserIcon } from "lucide-react"
import { logoutUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"

export const SidebarLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isHeaderUserMenuOpen, setIsHeaderUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const headerUserMenuRef = useRef<HTMLDivElement>(null)

  const displayName = user?.display_name || user?.username || user?.email || "User"
  const avatarInitial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }

      if (headerUserMenuRef.current && !headerUserMenuRef.current.contains(event.target as Node)) {
        setIsHeaderUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.error("Logout failed:", err)
    }

    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-[width] duration-200",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-3">
          {isSidebarOpen && (
            <Link to="/home" className="inline-flex items-center">
              <img src="/potero_text.svg" alt="Potero" className="h-7 w-auto" />
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen((current) => !current)}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
          <SidebarLink to="/home" icon={<Home className="h-4 w-4" />} label="Home" isOpen={isSidebarOpen} active={location.pathname === "/home" || location.pathname === "/"} />
        </nav>

        <div className="space-y-2 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className={cn("w-full justify-start", !isSidebarOpen && "justify-center px-0")}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            {isSidebarOpen && <span>Settings</span>}
          </Button>

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                !isSidebarOpen && "justify-center"
              )}
              aria-label="Open profile menu"
              aria-expanded={isUserMenuOpen}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
                {avatarInitial}
              </span>
              {isSidebarOpen && (
                <span className="min-w-0">
                  <span className="block truncate font-medium">{displayName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
                </span>
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute bottom-14 left-0 z-50 w-56 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    navigate("/profile")
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={cn("flex min-h-screen flex-1 flex-col transition-[padding-left] duration-200", isSidebarOpen ? "pl-64" : "pl-16")}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen((current) => !current)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div ref={headerUserMenuRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setIsHeaderUserMenuOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              aria-label="Open profile menu"
              aria-expanded={isHeaderUserMenuOpen}
            >
              {avatarInitial}
            </button>

            {isHeaderUserMenuOpen && (
              <div className="absolute top-11 right-0 z-50 w-56 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderUserMenuOpen(false)
                    navigate("/profile")
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

interface SidebarLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  isOpen: boolean
  active: boolean
}

const SidebarLink = ({ to, icon, label, isOpen, active }: SidebarLinkProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    className={cn("w-full justify-start", !isOpen && "justify-center px-0")}
    asChild
  >
    <Link to={to} title={label} aria-label={label}>
      {icon}
      {isOpen && <span>{label}</span>}
    </Link>
  </Button>
)
