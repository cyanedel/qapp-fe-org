import { useEffect, useState } from "react"
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { AUTH_SESSION_EXPIRED_EVENT, validateCurrentSession } from "@/api/auth"
import { Home } from "@/components/Home"
import { Login } from "@/components/Login"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout, setUser } = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const user = await validateCurrentSession()
        if (!isMounted) return

        setUser(user)
      } catch (err) {
        if (!isMounted) return

        console.error("Failed to validate session:", err)
        logout()
      } finally {
        if (isMounted) {
          setAuthChecked(true)
        }
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [logout, setUser])

  useEffect(() => {
    const handleSessionExpired = () => {
      logout()
      navigate("/login", { replace: true })
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [logout, navigate])

  useEffect(() => {
    const isLoginRoute = location.pathname === "/login"

    document.body.classList.toggle("login-light-surface", isLoginRoute)

    return () => document.body.classList.remove("login-light-surface")
  }, [location.pathname])

  const ProtectedRoute = () => {
    if (!authChecked) {
      return <AuthLoading />
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
  }

  const PublicOnlyRoute = () => {
    if (!authChecked) {
      return <AuthLoading />
    }

    return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />
  }

  return (
    <ThemeProvider>
      <div
        className={cn(
          "flex min-h-screen flex-col text-foreground antialiased",
          location.pathname === "/login" ? "bg-transparent dark:bg-background" : "bg-background"
        )}
      >
        <main className="flex-1">
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

const AuthLoading = () => (
  <div className="flex min-h-64 items-center justify-center text-muted-foreground">
    <Spinner className="mr-2 size-5" />
    Checking session...
  </div>
)

export default App
