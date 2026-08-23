import { useEffect, useMemo, useState, type FormEvent } from "react"
import { AlertCircle, ArrowLeft, Building2, Save, ShieldAlert, Trash2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getCurrentUser } from "@/api/auth"
import { deleteWorkspace, getWorkspace, updateWorkspace, type Workspace } from "@/api/workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"

export const ManageWorkspace = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [name, setName] = useState("")
  const [logo, setLogo] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteText, setDeleteText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isRepresentative = useMemo(
    () => Boolean(user?.user_id && workspace?.representatives?.includes(user.user_id)),
    [user?.user_id, workspace?.representatives]
  )

  useEffect(() => {
    let isMounted = true
    if (!workspaceId) {
      setError("Workspace not found.")
      setLoading(false)
      return
    }

    const loadWorkspace = async () => {
      try {
        const data = await getWorkspace(workspaceId)
        if (!isMounted) return
        setWorkspace(data)
        setName(data.display_name || "")
        setLogo(data.org_logo || "")
        setDescription(data.description || "")
        useAuthStore.getState().setActiveWorkspaceId(workspaceId)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load workspace.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadWorkspace()
    return () => {
      isMounted = false
    }
  }, [workspaceId])

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!workspaceId || !isRepresentative) return
    if (!name.trim()) {
      setError("Workspace name is required.")
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateWorkspace(workspaceId, { display_name: name.trim(), org_logo: logo.trim() || null, description: description.trim() || null })
      setWorkspace(updated)
      setName(updated.display_name || "")
      setLogo(updated.org_logo || "")
      setDescription(updated.description || "")
      setUser(await getCurrentUser())
      setSuccess("Workspace details saved.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workspace.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!workspaceId || !isRepresentative || deleteText !== (workspace?.display_name || "")) return
    setDeleting(true)
    setError(null)
    try {
      await deleteWorkspace(workspaceId)
      const refreshedUser = await getCurrentUser()
      setUser(refreshedUser)
      setActiveWorkspaceId(refreshedUser.org?.[0]?.org_id ?? null)
      navigate("/workspaces")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workspace.")
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><Spinner className="mr-2 size-5" />Loading workspace...</div>
  }

  if (error && !workspace) {
    return <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8"><Button asChild variant="ghost" className="-ml-2 w-fit"><Link to="/workspaces"><ArrowLeft className="h-4 w-4" />Back to workspaces</Link></Button><div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div></div>
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <Button asChild variant="ghost" className="-ml-2"><Link to="/workspaces"><ArrowLeft className="h-4 w-4" />Back to workspaces</Link></Button>
        <p className="text-sm font-medium text-primary">Workspace management</p>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight"><Building2 className="h-7 w-7 text-primary" />{workspace?.display_name || "Workspace"}</h1>
        <p className="text-sm text-muted-foreground">Update workspace details or remove this workspace.</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}

      {!isRepresentative ? (
        <Card><CardContent className="flex min-h-32 items-center gap-3 text-sm text-muted-foreground"><ShieldAlert className="h-5 w-5 text-amber-500" />Only workspace representatives can edit or remove this workspace.</CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Workspace details</CardTitle><CardDescription>These details are visible to workspace members.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSave}>
                <div className="space-y-2"><Label htmlFor="manage-workspace-name">Name</Label><Input id="manage-workspace-name" value={name} onChange={(event) => setName(event.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="manage-workspace-logo">Logo URL</Label><Input id="manage-workspace-logo" value={logo} onChange={(event) => setLogo(event.target.value)} type="url" placeholder="https://example.com/logo.png" /></div>
                <div className="space-y-2"><Label htmlFor="manage-workspace-description">Description</Label><textarea id="manage-workspace-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="A short description of this workspace" className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
                <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? <Spinner className="size-4" /> : <Save className="h-4 w-4" />}Save changes</Button></div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="h-5 w-5" />Danger zone</CardTitle><CardDescription>Deleting a workspace soft-deletes the workspace and its workspace-owned data. Permanent removal is handled separately.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="delete-workspace-confirmation">Type <span className="font-semibold">{workspace?.display_name}</span> to confirm</Label><Input id="delete-workspace-confirmation" value={deleteText} onChange={(event) => setDeleteText(event.target.value)} placeholder={workspace?.display_name || "Workspace name"} /></div>
              <Button type="button" variant="destructive" disabled={deleting || deleteText !== (workspace?.display_name || "")} onClick={handleDelete}><Trash2 className="h-4 w-4" />{deleting ? "Deleting..." : "Remove workspace"}</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
