import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Building2, Check, ChevronDown, Folder, FolderPlus, Home, List, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus, Settings, User as UserIcon, Users } from "lucide-react"
import { logoutUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/LanguageSelector"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"

export const SidebarLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, activeWorkspaceId, setActiveWorkspaceId } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isHeaderUserMenuOpen, setIsHeaderUserMenuOpen] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isCollectionsMenuOpen, setIsCollectionsMenuOpen] = useState(() => location.pathname.startsWith("/collections"))
  const [isWorkspacesMenuOpen, setIsWorkspacesMenuOpen] = useState(() => location.pathname.startsWith("/workspaces"))
  const userMenuRef = useRef<HTMLDivElement>(null)
  const headerUserMenuRef = useRef<HTMLDivElement>(null)
  const workspaceMenuRef = useRef<HTMLDivElement>(null)

  const displayName = user?.display_name || user?.username || user?.email || t("sidebar.user")
  const avatarInitial = displayName.charAt(0).toUpperCase()
  const workspaces = user?.org ?? []
  const selectedWorkspaceId = activeWorkspaceId || workspaces[0]?.org_id || ""
  const selectedWorkspace = workspaces.find((workspace) => workspace.org_id === selectedWorkspaceId)
  const selectedWorkspaceName = selectedWorkspace?.display_name || t("sidebar.noWorkspace")
  const isCollectionsRoute = location.pathname.startsWith("/collections")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }

      if (headerUserMenuRef.current && !headerUserMenuRef.current.contains(event.target as Node)) {
        setIsHeaderUserMenuOpen(false)
      }

      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false)
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
              <img src="/potero_text.svg" alt={t("app.name")} className="h-7 w-auto" />
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen((current) => !current)}
            aria-label={isSidebarOpen ? t("sidebar.collapse") : t("sidebar.expand")}
            title={isSidebarOpen ? t("sidebar.collapse") : t("sidebar.expand")}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label={t("sidebar.mainNavigation")}>
          <SidebarLink to="/home" icon={<Home className="h-4 w-4" />} label={t("sidebar.home")} isOpen={isSidebarOpen} active={location.pathname === "/home" || location.pathname === "/"} />
          <div className="space-y-1">
            <Button
              type="button"
              variant={isCollectionsRoute ? "secondary" : "ghost"}
              className={cn("w-full justify-start", !isSidebarOpen && "justify-center px-0")}
              onClick={() => {
                if (!isSidebarOpen) {
                  navigate("/collections")
                  return
                }

                setIsCollectionsMenuOpen((current) => !current)
              }}
              aria-expanded={isCollectionsMenuOpen}
              aria-controls="collections-sidebar-menu"
              title={t("sidebar.collections")}
            >
              <Folder className="h-4 w-4" />
              {isSidebarOpen && (
                <>
                  <span className="flex-1 text-left">{t("sidebar.collections")}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", !isCollectionsMenuOpen && "-rotate-90")} />
                </>
              )}
            </Button>
            {isSidebarOpen && isCollectionsMenuOpen && (
              <div id="collections-sidebar-menu" className="space-y-1 pl-4">
                <SidebarLink to="/collections" icon={<List className="h-4 w-4" />} label={t("sidebar.listCollections")} isOpen={isSidebarOpen} active={location.pathname === "/collections"} />
                <SidebarLink to="/collections/create" icon={<FolderPlus className="h-4 w-4" />} label={t("sidebar.createNew")} isOpen={isSidebarOpen} active={location.pathname === "/collections/create"} />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Button
              type="button"
              variant={location.pathname.startsWith("/workspaces") ? "secondary" : "ghost"}
              className={cn("w-full justify-start", !isSidebarOpen && "justify-center px-0")}
              onClick={() => {
                if (!isSidebarOpen) {
                  navigate("/workspaces")
                  return
                }
                setIsWorkspacesMenuOpen((current) => !current)
              }}
              aria-expanded={isWorkspacesMenuOpen}
              aria-controls="workspaces-sidebar-menu"
              title={t("sidebar.workspaces")}
            >
              <Users className="h-4 w-4" />
              {isSidebarOpen && <><span className="flex-1 text-left">{t("sidebar.workspaces")}</span><ChevronDown className={cn("h-4 w-4 transition-transform", !isWorkspacesMenuOpen && "-rotate-90")} /></>}
            </Button>
            {isSidebarOpen && isWorkspacesMenuOpen && (
              <div id="workspaces-sidebar-menu" className="space-y-1 pl-4">
                <SidebarLink to="/workspaces" icon={<List className="h-4 w-4" />} label={t("sidebar.allWorkspaces")} isOpen={isSidebarOpen} active={location.pathname === "/workspaces"} />
                <SidebarLink to="/workspaces/members" icon={<Users className="h-4 w-4" />} label={t("sidebar.members")} isOpen={isSidebarOpen} active={location.pathname === "/workspaces/members"} />
                <SidebarLink to="/workspaces/create" icon={<Plus className="h-4 w-4" />} label={t("sidebar.createNew")} isOpen={isSidebarOpen} active={location.pathname === "/workspaces/create"} />
              </div>
            )}
          </div>
        </nav>

        <div className="space-y-2 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className={cn("w-full justify-start", !isSidebarOpen && "justify-center px-0")}
            aria-label={t("sidebar.settings")}
            title={t("sidebar.settings")}
          >
            <Settings className="h-4 w-4" />
            {isSidebarOpen && <span>{t("sidebar.settings")}</span>}
          </Button>

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                !isSidebarOpen && "justify-center"
              )}
              aria-label={t("sidebar.openProfileMenu")}
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
                  {t("sidebar.profile")}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("sidebar.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={cn("flex min-h-screen flex-1 flex-col transition-[padding-left] duration-200", isSidebarOpen ? "pl-64" : "pl-16")}>
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen((current) => !current)}
              aria-label={t("sidebar.toggle")}
              title={t("sidebar.toggle")}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="ml-auto flex items-center gap-3">
              <LanguageSelector />
              <div ref={workspaceMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceMenuOpen((current) => !current)}
                  className="flex h-9 max-w-64 items-center gap-2 rounded-md border bg-card py-1 pr-2 pl-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  aria-label={t("sidebar.selectWorkspace")}
                  aria-expanded={isWorkspaceMenuOpen}
                >
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="hidden text-xs font-medium uppercase text-muted-foreground sm:inline">{t("sidebar.workspace")}</span>
                  <span className="max-w-36 truncate">{selectedWorkspaceName}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>

                {isWorkspaceMenuOpen && (
                  <div className="absolute top-11 right-0 z-50 w-64 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg">
                    <div className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">{t("sidebar.workspace")}</div>
                    {workspaces.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">{t("sidebar.noWorkspace")}</div>
                    ) : (
                      workspaces.map((workspace) => (
                        <button
                          key={workspace.org_id}
                          type="button"
                          onClick={() => {
                            setActiveWorkspaceId(workspace.org_id)
                            setIsWorkspaceMenuOpen(false)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
                        >
                          <Check className={cn("h-4 w-4", selectedWorkspaceId === workspace.org_id ? "text-primary" : "text-transparent")} />
                          <span className="truncate">{workspace.display_name || t("sidebar.untitledWorkspace")}</span>
                        </button>
                      ))
                    )}
                    <div className="my-1 border-t" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false)
                        navigate("/workspaces/create")
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      {t("sidebar.createWorkspace")}
                    </button>
                  </div>
                )}
              </div>

              <div ref={headerUserMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsHeaderUserMenuOpen((current) => !current)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                aria-label={t("sidebar.openProfileMenu")}
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
                    {t("sidebar.profile")}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("sidebar.logout")}
                  </button>
                </div>
              )}
              </div>
            </div>
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
