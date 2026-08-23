import { useState, type FormEvent } from "react"
import { ArrowLeft, Building2, Save } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { getCurrentUser } from "@/api/auth"
import { createWorkspace } from "@/api/workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"

export const CreateWorkspace = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setActiveWorkspaceId = useAuthStore((state) => state.setActiveWorkspaceId)
  const [name, setName] = useState("")
  const [logo, setLogo] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Workspace name is required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const workspace = await createWorkspace({ display_name: trimmedName, org_logo: logo.trim() || null, description: description.trim() || null })
      setUser(await getCurrentUser())
      setActiveWorkspaceId(workspace.org_id)
      navigate(`/workspaces/${workspace.org_id}/manage`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <Button asChild variant="ghost" className="-ml-2"><Link to="/workspaces"><ArrowLeft className="h-4 w-4" />Back to workspaces</Link></Button>
        <p className="text-sm font-medium text-primary">Workspaces</p>
        <h1 className="text-3xl font-bold tracking-tight">Create a new workspace</h1>
        <p className="text-sm text-muted-foreground">You will become the workspace representative and an active member.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Workspace details</CardTitle><CardDescription>Set the basic information for this workspace.</CardDescription></CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2"><Label htmlFor="workspace-name">Name</Label><Input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme School" autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="workspace-logo">Logo URL <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="workspace-logo" value={logo} onChange={(event) => setLogo(event.target.value)} placeholder="https://example.com/logo.png" type="url" /></div>
            <div className="space-y-2"><Label htmlFor="workspace-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label><textarea id="workspace-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short description of this workspace" rows={4} className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate("/workspaces")}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? <Spinner className="size-4" /> : <Save className="h-4 w-4" />}Create workspace</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
