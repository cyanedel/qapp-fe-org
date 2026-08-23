import { Building2, Plus, Settings2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"

export const Workspaces = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
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
          <p className="text-sm font-medium text-primary">Workspaces</p>
          <h1 className="text-3xl font-bold tracking-tight">Your workspaces</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Create and manage the organizations you represent.</p>
        </div>
        <Button asChild size="lg">
          <Link to="/workspaces/create"><Plus className="h-4 w-4" />New workspace</Link>
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card><CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><Building2 className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">You do not have a workspace yet.</p><Button asChild><Link to="/workspaces/create">Create workspace</Link></Button></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <Card key={workspace.org_id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                    <div className="min-w-0"><CardTitle className="truncate">{workspace.display_name || "Untitled workspace"}</CardTitle><CardDescription className="mt-1">Workspace</CardDescription></div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => openWorkspace(workspace.org_id)}><Settings2 className="h-4 w-4" />Manage</Button>
                </div>
              </CardHeader>
              <CardContent><p className="line-clamp-3 text-sm text-muted-foreground">{workspace.description || "No workspace description yet."}</p></CardContent>
            </Card>
          ))}
          <Card className="border-dashed transition-colors hover:border-primary/50 hover:bg-muted/30">
            <Link to="/workspaces/create" className="flex h-full min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Create workspace</CardTitle>
                <CardDescription className="mt-1">Start a new organization workspace.</CardDescription>
              </div>
            </Link>
          </Card>
        </div>
      )}
    </div>
  )
}
