import { Building2, Plus, Settings2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "react-i18next"

export const Workspaces = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const setActiveWorkspaceId = useAuthStore((state) => state.setActiveWorkspaceId)
  const workspaces = user?.org ?? []

  const openWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId)
    navigate(`/workspaces/${workspaceId}/manage`)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{t("workspaceList.eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t("workspaceList.title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("workspaceList.description")}</p>
        </div>
        <Button asChild size="lg">
          <Link to="/workspaces/create"><Plus className="h-4 w-4" />{t("workspaceList.newWorkspace")}</Link>
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card><CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><Building2 className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{t("workspaceList.empty")}</p><Button asChild><Link to="/workspaces/create">{t("workspaceList.createWorkspace")}</Link></Button></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => {
            const isActive = workspace.org_id === activeWorkspaceId

            return (
            <Card key={workspace.org_id} className={`transition-shadow hover:shadow-md ${isActive ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                    <div className="min-w-0"><CardTitle className="truncate">{workspace.display_name || t("workspaceList.untitled")}</CardTitle><CardDescription className="mt-1">{isActive ? t("workspaceList.active") : t("workspaceList.workspace")}</CardDescription></div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => openWorkspace(workspace.org_id)}><Settings2 className="h-4 w-4" />{t("workspaceList.manage")}</Button>
                </div>
              </CardHeader>
              <CardContent><p className="line-clamp-3 text-sm text-muted-foreground">{workspace.description || t("workspaceList.noDescription")}</p></CardContent>
            </Card>
            )
          })}
          <Card className="border-dashed transition-colors hover:border-primary/50 hover:bg-muted/30">
            <Link to="/workspaces/create" className="flex h-full min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{t("workspaceList.createCardTitle")}</CardTitle>
                <CardDescription className="mt-1">{t("workspaceList.createCardDescription")}</CardDescription>
              </div>
            </Link>
          </Card>
        </div>
      )}
    </div>
  )
}
