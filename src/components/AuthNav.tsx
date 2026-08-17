import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogIn, LogOut, User as UserIcon, UserPlus } from "lucide-react"
import { logoutUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export const AuthNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const isLogin = location.pathname === "/login"
  const isRegister = location.pathname === "/register"
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const displayName = user?.display_name || user?.username || user?.email || "User"
  const avatarInitial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-amber-900/10 bg-[#FFFAE5]/90 backdrop-blur-sm dark:border-border dark:bg-background/95">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/login" className="inline-flex items-center">
          <img src="/potero_text.svg" alt="Potero" className="h-7 w-auto" />
        </Link>

        {isAuthenticated && user ? (
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              aria-label="Open profile menu"
              aria-expanded={isUserMenuOpen}
            >
              {avatarInitial}
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-11 right-0 z-50 w-56 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg">
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
        ) : (
          <nav className="flex items-center gap-2" aria-label="Authentication">
            <Button variant={isLogin ? "default" : "ghost"} size="lg" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button variant={isRegister ? "default" : "outline"} size="lg" asChild>
              <Link to="/register">
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
