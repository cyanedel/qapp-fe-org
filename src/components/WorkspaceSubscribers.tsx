import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertCircle,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldAlert,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useTranslation } from "react-i18next"
import {
  addOrganizationSubscriber,
  assignSubscriberGroupMember,
  createSubscriberGroup,
  listOrganizationSubscribers,
  listSubscriberGroupMembers,
  listSubscriberGroups,
  removeOrganizationSubscriber,
  removeSubscriberGroup,
  removeSubscriberGroupMember,
  searchOrganizationSubscribers,
  updateOrganizationSubscriberStatus,
  updateSubscriberGroup,
} from "@/api/subscriber"
import { getWorkspace } from "@/api/workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"
import type {
  OrganizationSubscriber,
  SubscriberGroup,
  SubscriberGroupMember,
  SubscriberSearchResult,
  SubscriberStatus,
} from "@/types/subscriber"

type SubscriberView = "subscribers" | "groups"

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback

const statusClassName = (status: SubscriberStatus) => {
  if (status === "active") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (status === "suspended") return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "bg-muted text-muted-foreground"
}

export const WorkspaceSubscribers = () => {
  const { t, i18n } = useTranslation()
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const user = useAuthStore((state) => state.user)
  const [view, setView] = useState<SubscriberView>("subscribers")
  const [workspaceName, setWorkspaceName] = useState("")
  const [isRepresentative, setIsRepresentative] = useState(false)
  const [subscribers, setSubscribers] = useState<OrganizationSubscriber[]>([])
  const [groups, setGroups] = useState<SubscriberGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SubscriberSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [isNoResultsDialogOpen, setIsNoResultsDialogOpen] = useState(false)
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null)
  const [mutatingGroupId, setMutatingGroupId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<SubscriberGroup | null>(null)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [savingGroup, setSavingGroup] = useState(false)
  const [groupFormError, setGroupFormError] = useState<string | null>(null)

  const [isGroupMembersOpen, setIsGroupMembersOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<SubscriberGroup | null>(null)
  const [groupMembers, setGroupMembers] = useState<SubscriberGroupMember[]>([])
  const [groupMembersLoading, setGroupMembersLoading] = useState(false)
  const [groupCandidateQuery, setGroupCandidateQuery] = useState("")
  const [groupMembersError, setGroupMembersError] = useState<string | null>(null)
  const [groupMembersSuccess, setGroupMembersSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    setQuery("")
    setResults([])
    setIsNoResultsDialogOpen(false)
    setIsGroupFormOpen(false)
    setEditingGroup(null)
    setGroupName("")
    setGroupDescription("")
    setGroupFormError(null)
    setSelectedGroup(null)
    setGroupMembers([])
    setIsGroupMembersOpen(false)
    setGroupCandidateQuery("")
    setGroupMembersError(null)
    setGroupMembersSuccess(null)
    setMutatingUserId(null)
    setMutatingGroupId(null)
    setError(null)
    setSuccess(null)

    const load = async () => {
      if (!activeWorkspaceId) {
        setWorkspaceName("")
        setIsRepresentative(false)
        setSubscribers([])
        setGroups([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const workspace = await getWorkspace(activeWorkspaceId)
        if (!isMounted) return

        setWorkspaceName(workspace.display_name || t("subscribers.workspace"))
        const representative = Boolean(user?.user_id && workspace.representatives?.includes(user.user_id))
        setIsRepresentative(representative)

        if (!representative) {
          setSubscribers([])
          setGroups([])
          return
        }

        const [subscriberData, groupData] = await Promise.all([
          listOrganizationSubscribers(activeWorkspaceId),
          listSubscriberGroups(activeWorkspaceId),
        ])
        if (!isMounted) return
        setSubscribers(subscriberData)
        setGroups(groupData)
      } catch (loadError) {
        if (isMounted) setError(errorMessage(loadError, t("subscribers.loadFailed")))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [activeWorkspaceId, t, user?.user_id])

  const activeSubscriberIds = useMemo(
    () => new Set(subscribers.filter((subscriber) => subscriber.status === "active").map((subscriber) => subscriber.user_id)),
    [subscribers],
  )

  const assignedGroupMemberIds = useMemo(
    () => new Set(groupMembers.map((member) => member.user_id)),
    [groupMembers],
  )

  const availableGroupSubscribers = useMemo(() => {
    const normalizedQuery = groupCandidateQuery.trim().toLowerCase()
    return subscribers.filter((subscriber) => {
      if (subscriber.status !== "active" || assignedGroupMemberIds.has(subscriber.user_id)) return false
      if (!normalizedQuery) return true
      return [subscriber.display_name, subscriber.username, subscriber.email]
        .some((value) => value?.toLowerCase().includes(normalizedQuery))
    })
  }, [assignedGroupMemberIds, groupCandidateQuery, subscribers])

  const refreshSubscribers = async () => {
    if (!activeWorkspaceId) return
    setSubscribers(await listOrganizationSubscribers(activeWorkspaceId))
  }

  const refreshGroups = async () => {
    if (!activeWorkspaceId) return
    setGroups(await listSubscriberGroups(activeWorkspaceId))
  }

  const refreshGroupMembers = async (groupId: string) => {
    setGroupMembers(await listSubscriberGroupMembers(groupId))
  }

  const handleSearch = async () => {
    if (!activeWorkspaceId || query.trim().length < 2) return
    setSearching(true)
    setError(null)
    setSuccess(null)
    try {
      const searchResults = await searchOrganizationSubscribers(activeWorkspaceId, query.trim())
      setResults(searchResults)
      setIsNoResultsDialogOpen(searchResults.length === 0)
    } catch (searchError) {
      setError(errorMessage(searchError, t("subscribers.searchFailed")))
    } finally {
      setSearching(false)
    }
  }

  const handleAddSubscriber = async (candidate: SubscriberSearchResult) => {
    if (!activeWorkspaceId) return
    setMutatingUserId(candidate.user_id)
    setError(null)
    setSuccess(null)
    try {
      await addOrganizationSubscriber(activeWorkspaceId, candidate.user_id)
      await refreshSubscribers()
      setResults((current) => current.map((result) => result.user_id === candidate.user_id
        ? { ...result, subscription_status: "active" }
        : result))
      setSuccess(t("subscribers.added", { name: candidate.display_name || candidate.username }))
    } catch (addError) {
      setError(errorMessage(addError, t("subscribers.addFailed")))
    } finally {
      setMutatingUserId(null)
    }
  }

  const handleSubscriberStatus = async (subscriber: OrganizationSubscriber, status: "active" | "suspended") => {
    if (!activeWorkspaceId) return
    const label = subscriber.display_name || subscriber.username
    if (status === "suspended" && !window.confirm(t("subscribers.suspendConfirm", { name: label }))) return

    setMutatingUserId(subscriber.user_id)
    setError(null)
    setSuccess(null)
    try {
      await updateOrganizationSubscriberStatus(activeWorkspaceId, subscriber.user_id, status)
      await Promise.all([refreshSubscribers(), refreshGroups()])
      if (selectedGroup) await refreshGroupMembers(selectedGroup.group_id)
      setSuccess(status === "active"
        ? t("subscribers.reactivated", { name: label })
        : t("subscribers.suspended", { name: label }))
    } catch (statusError) {
      setError(errorMessage(statusError, t("subscribers.statusFailed")))
    } finally {
      setMutatingUserId(null)
    }
  }

  const handleRemoveSubscriber = async (subscriber: OrganizationSubscriber) => {
    if (!activeWorkspaceId) return
    const label = subscriber.display_name || subscriber.username
    if (!window.confirm(t("subscribers.removeConfirm", { name: label, workspace: workspaceName }))) return

    setMutatingUserId(subscriber.user_id)
    setError(null)
    setSuccess(null)
    try {
      await removeOrganizationSubscriber(activeWorkspaceId, subscriber.user_id)
      await Promise.all([refreshSubscribers(), refreshGroups()])
      if (selectedGroup) await refreshGroupMembers(selectedGroup.group_id)
      setSuccess(t("subscribers.removed", { name: label }))
    } catch (removeError) {
      setError(errorMessage(removeError, t("subscribers.removeFailed")))
    } finally {
      setMutatingUserId(null)
    }
  }

  const openCreateGroup = () => {
    setEditingGroup(null)
    setGroupName("")
    setGroupDescription("")
    setGroupFormError(null)
    setIsGroupFormOpen(true)
  }

  const openEditGroup = (group: SubscriberGroup) => {
    setEditingGroup(group)
    setGroupName(group.name)
    setGroupDescription(group.description || "")
    setGroupFormError(null)
    setIsGroupFormOpen(true)
  }

  const handleGroupFormOpenChange = (open: boolean) => {
    setIsGroupFormOpen(open)
    if (!open) {
      setEditingGroup(null)
      setGroupName("")
      setGroupDescription("")
      setGroupFormError(null)
    }
  }

  const handleSaveGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeWorkspaceId || !groupName.trim()) return

    setSavingGroup(true)
    setGroupFormError(null)
    setSuccess(null)
    try {
      const input = { name: groupName.trim(), description: groupDescription.trim() || null }
      const savedGroup = editingGroup
        ? await updateSubscriberGroup(editingGroup.group_id, input)
        : await createSubscriberGroup(activeWorkspaceId, input)
      await refreshGroups()
      if (selectedGroup?.group_id === savedGroup.group_id) setSelectedGroup(savedGroup)
      setSuccess(editingGroup
        ? t("subscriberGroups.updated", { name: savedGroup.name })
        : t("subscriberGroups.created", { name: savedGroup.name }))
      handleGroupFormOpenChange(false)
    } catch (saveError) {
      setGroupFormError(errorMessage(saveError, editingGroup ? t("subscriberGroups.updateFailed") : t("subscriberGroups.createFailed")))
    } finally {
      setSavingGroup(false)
    }
  }

  const handleRemoveGroup = async (group: SubscriberGroup) => {
    if (!window.confirm(t("subscriberGroups.removeConfirm", { name: group.name }))) return

    setMutatingGroupId(group.group_id)
    setError(null)
    setSuccess(null)
    try {
      await removeSubscriberGroup(group.group_id)
      await refreshGroups()
      if (selectedGroup?.group_id === group.group_id) {
        setSelectedGroup(null)
        setGroupMembers([])
        setIsGroupMembersOpen(false)
      }
      setSuccess(t("subscriberGroups.removed", { name: group.name }))
    } catch (removeError) {
      setError(errorMessage(removeError, t("subscriberGroups.removeFailed")))
    } finally {
      setMutatingGroupId(null)
    }
  }

  const openGroupMembers = async (group: SubscriberGroup) => {
    setSelectedGroup(group)
    setGroupMembers([])
    setGroupCandidateQuery("")
    setGroupMembersError(null)
    setGroupMembersSuccess(null)
    setIsGroupMembersOpen(true)
    setGroupMembersLoading(true)
    try {
      await refreshGroupMembers(group.group_id)
    } catch (membersError) {
      setGroupMembersError(errorMessage(membersError, t("subscriberGroups.membersLoadFailed")))
    } finally {
      setGroupMembersLoading(false)
    }
  }

  const handleAssignGroupMember = async (subscriber: OrganizationSubscriber) => {
    if (!selectedGroup) return
    setMutatingUserId(subscriber.user_id)
    setGroupMembersError(null)
    setGroupMembersSuccess(null)
    try {
      await assignSubscriberGroupMember(selectedGroup.group_id, subscriber.user_id)
      await Promise.all([refreshGroupMembers(selectedGroup.group_id), refreshGroups()])
      setGroupMembersSuccess(t("subscriberGroups.assigned", {
        name: subscriber.display_name || subscriber.username,
        group: selectedGroup.name,
      }))
    } catch (assignError) {
      setGroupMembersError(errorMessage(assignError, t("subscriberGroups.assignFailed")))
    } finally {
      setMutatingUserId(null)
    }
  }

  const handleRemoveGroupMember = async (member: SubscriberGroupMember) => {
    if (!selectedGroup) return
    const label = member.display_name || member.username
    if (!window.confirm(t("subscriberGroups.removeMemberConfirm", { name: label, group: selectedGroup.name }))) return

    setMutatingUserId(member.user_id)
    setGroupMembersError(null)
    setGroupMembersSuccess(null)
    try {
      await removeSubscriberGroupMember(selectedGroup.group_id, member.user_id)
      await Promise.all([refreshGroupMembers(selectedGroup.group_id), refreshGroups()])
      setGroupMembersSuccess(t("subscriberGroups.memberRemoved", { name: label, group: selectedGroup.name }))
    } catch (removeError) {
      setGroupMembersError(errorMessage(removeError, t("subscriberGroups.memberRemoveFailed")))
    } finally {
      setMutatingUserId(null)
    }
  }

  const formatDate = (value: string) => new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value))

  if (!activeWorkspaceId) {
    return <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8"><Card><CardContent className="flex min-h-40 items-center gap-3 text-sm text-muted-foreground"><UsersRound className="h-5 w-5" />{t("subscribers.selectWorkspace")}</CardContent></Card></div>
  }

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><Spinner className="mr-2 size-5" />{t("subscribers.loading")}</div>
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("subscribers.workspace")}</p>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight"><UsersRound className="h-7 w-7 text-primary" />{t("subscribers.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subscribers.description", { workspace: workspaceName })}</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}

      {!isRepresentative ? (
        <Card><CardContent className="flex min-h-32 items-center gap-3 text-sm text-muted-foreground"><ShieldAlert className="h-5 w-5 text-amber-500" />{t("subscribers.representativeOnly")}</CardContent></Card>
      ) : (
        <>
          <div className="flex w-fit rounded-lg border bg-muted/40 p-1">
            <Button type="button" variant={view === "subscribers" ? "secondary" : "ghost"} onClick={() => setView("subscribers")}><UsersRound className="h-4 w-4" />{t("subscribers.tab")}</Button>
            <Button type="button" variant={view === "groups" ? "secondary" : "ghost"} onClick={() => setView("groups")}><Users className="h-4 w-4" />{t("subscriberGroups.tab")}</Button>
          </div>

          {view === "subscribers" ? (
            <>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />{t("subscribers.add")}</CardTitle><CardDescription>{t("subscribers.searchDescription")}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row"><Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void handleSearch() } }} placeholder={t("subscribers.searchPlaceholder")} /><Button type="button" onClick={() => void handleSearch()} disabled={searching || query.trim().length < 2}>{searching ? <Spinner className="size-4" /> : <Search className="h-4 w-4" />}{t("subscribers.search")}</Button></div>
                  {results.length > 0 && <div className="divide-y rounded-md border">{results.map((candidate) => { const isActive = activeSubscriberIds.has(candidate.user_id); const label = candidate.display_name || candidate.username; return <div key={candidate.user_id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-medium">{label}</p><p className="truncate text-sm text-muted-foreground">@{candidate.username} · {candidate.email}</p></div><Button type="button" size="sm" disabled={isActive || mutatingUserId === candidate.user_id} onClick={() => void handleAddSubscriber(candidate)}>{mutatingUserId === candidate.user_id ? <Spinner className="size-4" /> : <UserPlus className="h-4 w-4" />}{isActive ? t("subscriberTable.alreadyActive") : candidate.subscription_status ? t("subscriberTable.reactivate") : t("subscribers.add")}</Button></div> })}</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>{t("subscribers.title")}</CardTitle><CardDescription>{t("subscribers.auditDescription")}</CardDescription></CardHeader>
                <CardContent>{subscribers.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{t("subscriberTable.empty")}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b text-muted-foreground"><tr><th className="px-3 py-2 font-medium">{t("subscriberTable.subscriber")}</th><th className="px-3 py-2 font-medium">{t("subscriberTable.status")}</th><th className="px-3 py-2 font-medium">{t("subscriberTable.subscribedAt")}</th><th className="px-3 py-2 text-right font-medium">{t("subscriberTable.actions")}</th></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.subscription_id} className="border-b last:border-0"><td className="px-3 py-3"><p className="font-medium">{subscriber.display_name || subscriber.username}</p><p className="text-muted-foreground">@{subscriber.username} · {subscriber.email}</p></td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClassName(subscriber.status)}`}>{t(`subscriberTable.status_${subscriber.status}`)}</span></td><td className="px-3 py-3 text-muted-foreground">{formatDate(subscriber.subscribed_at)}</td><td className="px-3 py-3 text-right"><SubscriberActions subscriber={subscriber} isMutating={mutatingUserId === subscriber.user_id} onStatusChange={handleSubscriberStatus} onRemove={handleRemoveSubscriber} /></td></tr>)}</tbody></table></div>}</CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4"><div className="space-y-1"><CardTitle>{t("subscriberGroups.title")}</CardTitle><CardDescription>{t("subscriberGroups.description")}</CardDescription></div><Button type="button" onClick={openCreateGroup}><FolderPlus className="h-4 w-4" />{t("subscriberGroups.create")}</Button></CardHeader>
              <CardContent>{groups.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{t("subscriberGroups.empty")}</p> : <div className="grid gap-4 md:grid-cols-2">{groups.map((group) => <div key={group.group_id} className="flex flex-col gap-4 rounded-lg border p-4"><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{group.name}</h3><p className="mt-1 text-sm text-muted-foreground">{group.description || t("subscriberGroups.noDescription")}</p></div><span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{t("subscriberGroups.count", { count: group.subscriber_count })}</span></div></div><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" size="sm" disabled={mutatingGroupId === group.group_id} onClick={() => openEditGroup(group)}><Pencil className="h-4 w-4" />{t("subscriberGroups.edit")}</Button><Button type="button" size="sm" disabled={mutatingGroupId === group.group_id} onClick={() => void openGroupMembers(group)}><Users className="h-4 w-4" />{t("subscriberGroups.manage")}</Button><Button type="button" variant="destructive" size="sm" disabled={mutatingGroupId === group.group_id} onClick={() => void handleRemoveGroup(group)}>{mutatingGroupId === group.group_id ? <Spinner className="size-4" /> : <Trash2 className="h-4 w-4" />}{t("subscriberGroups.remove")}</Button></div></div>)}</div>}</CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={isNoResultsDialogOpen} onOpenChange={(open) => { setIsNoResultsDialogOpen(open); if (!open) setQuery("") }}>
        <DialogContent><DialogHeader><DialogTitle>{t("subscribers.noResultsTitle")}</DialogTitle><DialogDescription>{t("subscribers.noResultsDescription")}</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button type="button">{t("subscribers.noResultsClose")}</Button></DialogClose></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={isGroupFormOpen} onOpenChange={handleGroupFormOpenChange}>
        <DialogContent>
          <form className="space-y-4" onSubmit={handleSaveGroup}>
            <DialogHeader><DialogTitle>{editingGroup ? t("subscriberGroups.editTitle") : t("subscriberGroups.createTitle")}</DialogTitle><DialogDescription>{t("subscriberGroups.formDescription")}</DialogDescription></DialogHeader>
            {groupFormError && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{groupFormError}</div>}
            <div className="space-y-2"><Label htmlFor="subscriber-group-name">{t("subscriberGroups.name")}</Label><Input id="subscriber-group-name" value={groupName} onChange={(event) => setGroupName(event.target.value)} maxLength={100} autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="subscriber-group-description">{t("subscriberGroups.groupDescription")}</Label><textarea id="subscriber-group-description" value={groupDescription} onChange={(event) => setGroupDescription(event.target.value)} rows={3} className="flex min-h-20 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">{t("subscriberGroups.cancel")}</Button></DialogClose><Button type="submit" disabled={savingGroup || !groupName.trim()}>{savingGroup ? <Spinner className="size-4" /> : null}{t("subscriberGroups.save")}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupMembersOpen} onOpenChange={(open) => { setIsGroupMembersOpen(open); if (!open) { setSelectedGroup(null); setGroupMembers([]); setGroupCandidateQuery(""); setGroupMembersError(null); setGroupMembersSuccess(null) } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle>{t("subscriberGroups.manageTitle", { group: selectedGroup?.name })}</DialogTitle><DialogDescription>{t("subscriberGroups.manageDescription")}</DialogDescription></DialogHeader>
          {groupMembersError && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{groupMembersError}</div>}
          {groupMembersSuccess && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{groupMembersSuccess}</div>}
          {groupMembersLoading ? <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground"><Spinner className="mr-2 size-5" />{t("subscriberGroups.membersLoading")}</div> : <div className="grid gap-5 md:grid-cols-2"><section className="space-y-3"><div><h3 className="text-sm font-semibold">{t("subscriberGroups.currentMembers")}</h3><p className="text-xs text-muted-foreground">{t("subscriberGroups.currentMembersDescription")}</p></div>{groupMembers.length === 0 ? <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">{t("subscriberGroups.noMembers")}</p> : <div className="divide-y rounded-md border">{groupMembers.map((member) => <div key={member.user_id} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{member.display_name || member.username}</p><p className="truncate text-xs text-muted-foreground">@{member.username} · {member.email}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClassName(member.subscription_status)}`}>{t(`subscriberTable.status_${member.subscription_status}`)}</span></div><Button type="button" variant="ghost" size="icon" disabled={mutatingUserId === member.user_id} aria-label={t("subscriberGroups.removeMember", { name: member.display_name || member.username })} onClick={() => void handleRemoveGroupMember(member)}>{mutatingUserId === member.user_id ? <Spinner className="size-4" /> : <UserMinus className="h-4 w-4 text-destructive" />}</Button></div>)}</div>}</section><section className="space-y-3"><div><h3 className="text-sm font-semibold">{t("subscriberGroups.addMembers")}</h3><p className="text-xs text-muted-foreground">{t("subscriberGroups.addMembersDescription")}</p></div><Input value={groupCandidateQuery} onChange={(event) => setGroupCandidateQuery(event.target.value)} placeholder={t("subscriberGroups.filterPlaceholder")} />{availableGroupSubscribers.length === 0 ? <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">{t("subscriberGroups.noAvailableSubscribers")}</p> : <div className="max-h-80 divide-y overflow-y-auto rounded-md border">{availableGroupSubscribers.map((subscriber) => <div key={subscriber.user_id} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{subscriber.display_name || subscriber.username}</p><p className="truncate text-xs text-muted-foreground">@{subscriber.username} · {subscriber.email}</p></div><Button type="button" size="sm" disabled={mutatingUserId === subscriber.user_id} onClick={() => void handleAssignGroupMember(subscriber)}>{mutatingUserId === subscriber.user_id ? <Spinner className="size-4" /> : <UserPlus className="h-4 w-4" />}{t("subscriberGroups.assign")}</Button></div>)}</div>}</section></div>}
          <DialogFooter><DialogClose asChild><Button type="button">{t("subscriberGroups.done")}</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface SubscriberActionsProps {
  subscriber: OrganizationSubscriber
  isMutating: boolean
  onStatusChange: (subscriber: OrganizationSubscriber, status: "active" | "suspended") => void
  onRemove: (subscriber: OrganizationSubscriber) => void
}

const SubscriberActions = ({ subscriber, isMutating, onStatusChange, onRemove }: SubscriberActionsProps) => {
  const { t } = useTranslation()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted" aria-label={t("subscriberActions.manage", { name: subscriber.display_name || subscriber.username })}><MoreHorizontal className="h-4 w-4" /></button></DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="z-50 w-48 overflow-hidden rounded-md border bg-popover py-1 text-popover-foreground shadow-lg">
          <DropdownMenu.Item disabled={isMutating} onSelect={() => onStatusChange(subscriber, subscriber.status === "active" ? "suspended" : "active")} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">{isMutating ? <Spinner className="size-4" /> : <UsersRound className="h-4 w-4" />}{subscriber.status === "active" ? t("subscriberActions.suspend") : t("subscriberActions.reactivate")}</DropdownMenu.Item>
          {subscriber.status !== "removed" && <DropdownMenu.Item disabled={isMutating} onSelect={() => onRemove(subscriber)} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"><UserMinus className="h-4 w-4" />{t("subscriberActions.remove")}</DropdownMenu.Item>}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
