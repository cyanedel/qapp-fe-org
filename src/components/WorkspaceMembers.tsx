import { useEffect, useMemo, useState } from "react"
import { AlertCircle, MoreHorizontal, Search, ShieldAlert, UserCog, UserMinus, UserPlus, Users } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { addOrganizationMember, addOrganizationRepresentative, listOrganizationMembers, removeOrganizationMember, removeOrganizationRepresentative, searchOrganizationUsers, updateOrganizationMemberStatus } from "@/api/member"
import { getWorkspace } from "@/api/workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"
import type { OrganizationMember, UserSearchResult } from "@/types/member"

export const WorkspaceMembers = () => {
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const user = useAuthStore((state) => state.user)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [workspaceName, setWorkspaceName] = useState("Workspace")
  const [isRepresentative, setIsRepresentative] = useState(false)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadMembers = async () => {
    if (!activeWorkspaceId) return
    const data = await listOrganizationMembers(activeWorkspaceId)
    setMembers(data)
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!activeWorkspaceId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const workspace = await getWorkspace(activeWorkspaceId)
        if (!isMounted) return
        setWorkspaceName(workspace.display_name || "Workspace")
        const representative = Boolean(user?.user_id && workspace.representatives?.includes(user.user_id))
        setIsRepresentative(representative)
        if (representative) await loadMembers()
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load workspace members.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [activeWorkspaceId, user?.user_id])

  const activeMemberIds = useMemo(() => new Set(members.filter((member) => member.status === "active").map((member) => member.user_id)), [members])

  const handleSearch = async () => {
    if (!activeWorkspaceId || query.trim().length < 2) return
    setSearching(true)
    setError(null)
    try {
      setResults(await searchOrganizationUsers(activeWorkspaceId, query.trim()))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search users.")
    } finally {
      setSearching(false)
    }
  }

  const handleAdd = async (candidate: UserSearchResult) => {
    if (!activeWorkspaceId) return
    setMutatingUserId(candidate.user_id)
    setError(null)
    setSuccess(null)
    try {
      await addOrganizationMember(activeWorkspaceId, candidate.user_id)
      await loadMembers()
      setResults((current) => current.filter((result) => result.user_id !== candidate.user_id))
      setSuccess(`${candidate.display_name || candidate.username} is now a workspace member.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add workspace member.")
    } finally {
      setMutatingUserId(null)
    }
  }

  const handleRemove = async (member: OrganizationMember) => {
    if (!activeWorkspaceId || !window.confirm(`Remove ${member.display_name || member.username} from ${workspaceName}?`)) return
    setMutatingUserId(member.user_id)
    setError(null)
    setSuccess(null)
    try {
      await removeOrganizationMember(activeWorkspaceId, member.user_id)
      await loadMembers()
      setSuccess(`${member.display_name || member.username} was removed from the workspace.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove workspace member.")
    } finally {
      setMutatingUserId(null)
    }
  }

  const handleStatusChange = async (member: OrganizationMember, status: "active" | "suspended") => {
    if (!activeWorkspaceId) return
    const label = member.display_name || member.username
    if (status === "suspended" && !window.confirm(`Suspend ${label}'s workspace membership?`)) return
    setMutatingUserId(member.user_id)
    setError(null)
    setSuccess(null)
    try {
      await updateOrganizationMemberStatus(activeWorkspaceId, member.user_id, status)
      await loadMembers()
      setSuccess(status === "suspended" ? `${label} was suspended.` : `${label} was reactivated.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workspace member status.")
    } finally {
      setMutatingUserId(null)
    }
  }

  const handleRepresentativeChange = async (member: OrganizationMember) => {
    if (!activeWorkspaceId) return
    const label = member.display_name || member.username
    const action = member.is_representative ? "revoke representative access for" : "make"
    if (!window.confirm(`${action} ${label}${member.is_representative ? "" : " a representative"}?`)) return
    setMutatingUserId(member.user_id)
    setError(null)
    setSuccess(null)
    try {
      if (member.is_representative) {
        await removeOrganizationRepresentative(activeWorkspaceId, member.user_id)
        setSuccess(`Representative access was revoked for ${label}.`)
      } else {
        await addOrganizationRepresentative(activeWorkspaceId, member.user_id)
        setSuccess(`${label} is now a representative.`)
      }
      await loadMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update representative access.")
    } finally {
      setMutatingUserId(null)
    }
  }

  if (!activeWorkspaceId) {
    return <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8"><Card><CardContent className="flex min-h-40 items-center gap-3 text-sm text-muted-foreground"><Users className="h-5 w-5" />Select an active workspace to manage its members.</CardContent></Card></div>
  }

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><Spinner className="mr-2 size-5" />Loading workspace members...</div>
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Workspace</p>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight"><Users className="h-7 w-7 text-primary" />Members</h1>
        <p className="text-sm text-muted-foreground">Manage members for {workspaceName}.</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}

      {!isRepresentative ? (
        <Card><CardContent className="flex min-h-32 items-center gap-3 text-sm text-muted-foreground"><ShieldAlert className="h-5 w-5 text-amber-500" />Only workspace representatives can manage members.</CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Add a member</CardTitle><CardDescription>Search registered organization users by username or email.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row"><Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleSearch() } }} placeholder="Username or email" /><Button type="button" onClick={handleSearch} disabled={searching || query.trim().length < 2}>{searching ? <Spinner className="size-4" /> : <Search className="h-4 w-4" />}Search</Button></div>
              {results.length > 0 && <div className="divide-y rounded-md border">{results.map((candidate) => { const isActive = activeMemberIds.has(candidate.user_id); const label = candidate.display_name || candidate.username; return <div key={candidate.user_id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-medium">{label}</p><p className="truncate text-sm text-muted-foreground">@{candidate.username} · {candidate.email}</p></div><Button type="button" size="sm" disabled={isActive || mutatingUserId === candidate.user_id} onClick={() => handleAdd(candidate)}>{mutatingUserId === candidate.user_id ? <Spinner className="size-4" /> : <UserPlus className="h-4 w-4" />}{isActive ? "Already active" : candidate.membership_status ? "Reactivate" : "Add member"}</Button></div> })}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Members</CardTitle><CardDescription>Active, suspended, and removed memberships are retained for audit history.</CardDescription></CardHeader>
            <CardContent>{members.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No members found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b text-muted-foreground"><tr><th className="px-3 py-2 font-medium">Member</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">Access</th><th className="px-3 py-2 text-right font-medium">Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.membership_id} className="border-b last:border-0"><td className="px-3 py-3"><p className="font-medium">{member.display_name || member.username}</p><p className="text-muted-foreground">@{member.username} · {member.email}</p></td><td className="px-3 py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">{member.status}</span></td><td className="px-3 py-3">{member.is_representative ? "Representative" : "Member"}</td><td className="px-3 py-3 text-right"><MemberActions member={member} isMutating={mutatingUserId === member.user_id} onStatusChange={handleStatusChange} onRepresentativeChange={handleRepresentativeChange} onRemove={handleRemove} /></td></tr>)}</tbody></table></div>}</CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

interface MemberActionsProps {
  member: OrganizationMember
  isMutating: boolean
  onStatusChange: (member: OrganizationMember, status: "active" | "suspended") => void
  onRepresentativeChange: (member: OrganizationMember) => void
  onRemove: (member: OrganizationMember) => void
}

const MemberActions = ({ member, isMutating, onStatusChange, onRepresentativeChange, onRemove }: MemberActionsProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted" aria-label={`Manage ${member.display_name || member.username}`}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content align="end" sideOffset={6} className="z-50 w-48 overflow-hidden rounded-md border bg-popover py-1 text-popover-foreground shadow-lg">
        <DropdownMenu.Item disabled={isMutating} onSelect={() => onStatusChange(member, member.status === "active" ? "suspended" : "active")} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
          {isMutating ? <Spinner className="size-4" /> : <UserCog className="h-4 w-4" />}
          {member.status === "active" ? "Suspend member" : "Reactivate member"}
        </DropdownMenu.Item>
        {member.status === "active" && <>
          <DropdownMenu.Item disabled={isMutating} onSelect={() => onRepresentativeChange(member)} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"><UserCog className="h-4 w-4" />{member.is_representative ? "Revoke representative" : "Make representative"}</DropdownMenu.Item>
          <DropdownMenu.Item disabled={isMutating} onSelect={() => onRemove(member)} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"><UserMinus className="h-4 w-4" />Remove member</DropdownMenu.Item>
        </>}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
)
