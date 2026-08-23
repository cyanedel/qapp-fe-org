import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/auth"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  activeWorkspaceId: string | null
  setUser: (user: User | null) => void
  setActiveWorkspaceId: (workspaceId: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      activeWorkspaceId: null,
      setUser: (user) =>
        set((current) => {
          if (!user) {
            return { user: null, isAuthenticated: false, activeWorkspaceId: null }
          }

          const availableWorkspaceIds = new Set(user.org?.map((workspace) => workspace.org_id) ?? user.org_id ?? [])
          const activeWorkspaceId = availableWorkspaceIds.has(current.activeWorkspaceId ?? "")
            ? current.activeWorkspaceId
            : user.org?.[0]?.org_id ?? user.org_id?.[0] ?? null

          return { user, isAuthenticated: true, activeWorkspaceId }
        }),
      setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
      logout: () => set({ user: null, isAuthenticated: false, activeWorkspaceId: null }),
    }),
    {
      name: "qapp-org-auth-storage",
    }
  )
)
