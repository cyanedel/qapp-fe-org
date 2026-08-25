import { useEffect, useState } from "react"
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AUTH_SESSION_EXPIRED_EVENT, validateCurrentSession } from "@/api/auth"
import { CollectionList } from "@/components/CollectionList"
import { CreateCollection } from "@/components/CreateCollection"
import { EditCollection } from "@/components/EditCollection"
import { Home } from "@/components/Home"
import { Login } from "@/components/Login"
import { Profile } from "@/components/Profile"
import { Register } from "@/components/Register"
import { SidebarLayout } from "@/components/SidebarLayout"
import { Workspaces } from "@/components/Workspaces"
import { CreateWorkspace } from "@/components/CreateWorkspace"
import { ManageWorkspace } from "@/components/ManageWorkspace"
import { WorkspaceMembers } from "@/components/WorkspaceMembers"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"

function App() {
  const { t } = useTranslation()
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
    const isLoginRoute = location.pathname === "/login" || location.pathname === "/register"

    document.body.classList.toggle("login-light-surface", isLoginRoute)

    return () => document.body.classList.remove("login-light-surface")
  }, [location.pathname])

  const ProtectedRoute = () => {
    if (!authChecked) {
      return <AuthLoading label={t("app.checkingSession")} />
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
  }

  const PublicOnlyRoute = () => {
    if (!authChecked) {
      return <AuthLoading label={t("app.checkingSession")} />
    }

    return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />
  }

  return (
    <ThemeProvider>
      <div
        className={cn(
          "flex min-h-screen flex-col text-foreground antialiased",
          location.pathname === "/login" || location.pathname === "/register"
            ? "bg-transparent dark:bg-background"
            : "bg-background"
        )}
      >
        <main className="flex-1">
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<SidebarLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/collections" element={<CollectionList />} />
                <Route path="/collections/create" element={<CreateCollection />} />
                <Route path="/collections/:collectionId/edit" element={<EditCollection />} />
                <Route path="/workspaces" element={<Workspaces />} />
                <Route path="/workspaces/create" element={<CreateWorkspace />} />
                <Route path="/workspaces/:workspaceId/manage" element={<ManageWorkspace />} />
                <Route path="/workspaces/members" element={<WorkspaceMembers />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

const AuthLoading = ({ label }: { label: string }) => (
  <div className="flex min-h-64 items-center justify-center text-muted-foreground">
    <Spinner className="mr-2 size-5" />
    {label}
  </div>
)

export default App
