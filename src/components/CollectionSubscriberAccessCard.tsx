import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Search, Users, UsersRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { getCollectionSubscriberGrantOptions } from "@/api/collection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { CollectionDetailsValues } from "@/types/collection"
import type { OrganizationSubscriber, SubscriberGroup, SubscriberStatus } from "@/types/subscriber"

interface CollectionSubscriberAccessCardProps {
  organizationId: string
  values: CollectionDetailsValues
  disabled?: boolean
  onChange: (values: CollectionDetailsValues) => void
}

const statusClassName = (status: SubscriberStatus) => {
  if (status === "active") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (status === "suspended") return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "bg-muted text-muted-foreground"
}

export const CollectionSubscriberAccessCard = ({
  organizationId,
  values,
  disabled = false,
  onChange,
}: CollectionSubscriberAccessCardProps) => {
  const { t } = useTranslation()
  const [subscribers, setSubscribers] = useState<OrganizationSubscriber[]>([])
  const [groups, setGroups] = useState<SubscriberGroup[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    setQuery("")

    const loadOptions = async () => {
      if (!organizationId) {
        setSubscribers([])
        setGroups([])
        setLoading(false)
        return
      }
      try {
        const options = await getCollectionSubscriberGrantOptions(organizationId)
        if (!isMounted) return
        setSubscribers(options.subscribers)
        setGroups(options.groups)
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t("collectionSubscriberAccess.loadFailed"))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadOptions()
    return () => { isMounted = false }
  }, [organizationId, t])

  const selectedSubscriberIds = useMemo(() => new Set(values.subscriberIds), [values.subscriberIds])
  const selectedGroupIds = useMemo(() => new Set(values.subscriberGroupIds), [values.subscriberGroupIds])
  const knownSubscriberIds = useMemo(() => new Set(subscribers.map((subscriber) => subscriber.user_id)), [subscribers])

  const filteredSubscribers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return subscribers
    return subscribers.filter((subscriber) =>
      [subscriber.display_name, subscriber.username, subscriber.email]
        .some((value) => value?.toLowerCase().includes(normalizedQuery)))
  }, [query, subscribers])

  const unavailableSubscriberIds = useMemo(
    () => values.subscriberIds.filter((userId) => !knownSubscriberIds.has(userId)),
    [knownSubscriberIds, values.subscriberIds],
  )

  const toggleSubscriber = (subscriberId: string) => {
    const nextSubscriberIds = selectedSubscriberIds.has(subscriberId)
      ? values.subscriberIds.filter((userId) => userId !== subscriberId)
      : [...values.subscriberIds, subscriberId]
    onChange({ ...values, subscriberIds: nextSubscriberIds })
  }

  const toggleGroup = (groupId: string) => {
    const nextGroupIds = selectedGroupIds.has(groupId)
      ? values.subscriberGroupIds.filter((currentGroupId) => currentGroupId !== groupId)
      : [...values.subscriberGroupIds, groupId]
    onChange({ ...values, subscriberGroupIds: nextGroupIds })
  }

  const hasSelections = values.subscriberIds.length > 0 || values.subscriberGroupIds.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UsersRound className="h-5 w-5 text-primary" />{t("collectionSubscriberAccess.title")}</CardTitle>
        <CardDescription>{t("collectionSubscriberAccess.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
        {loading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground"><Spinner className="mr-2 size-5" />{t("collectionSubscriberAccess.loading")}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold"><UsersRound className="h-4 w-4" />{t("collectionSubscriberAccess.individuals")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t("collectionSubscriberAccess.individualsDescription")}</p>
              </div>
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("collectionSubscriberAccess.searchPlaceholder")} className="pl-9" disabled={disabled} /></div>
              <div className="max-h-80 divide-y overflow-y-auto rounded-md border">
                {filteredSubscribers.length === 0 && unavailableSubscriberIds.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">{t("collectionSubscriberAccess.noSubscribers")}</p>
                ) : (
                  <>
                    {filteredSubscribers.map((subscriber) => {
                      const selected = selectedSubscriberIds.has(subscriber.user_id)
                      const selectable = subscriber.status === "active" || selected
                      return (
                        <label key={subscriber.user_id} className={`flex items-start gap-3 p-3 ${selectable && !disabled ? "cursor-pointer hover:bg-muted/50" : "cursor-not-allowed opacity-60"}`}>
                          <input type="checkbox" className="mt-1 size-4 accent-primary" checked={selected} disabled={disabled || !selectable} onChange={() => toggleSubscriber(subscriber.user_id)} />
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{subscriber.display_name || subscriber.username}</span><span className="block truncate text-xs text-muted-foreground">@{subscriber.username} · {subscriber.email}</span><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClassName(subscriber.status)}`}>{t(`subscriberTable.status_${subscriber.status}`)}</span></span>
                        </label>
                      )
                    })}
                    {unavailableSubscriberIds.map((subscriberId) => (
                      <label key={subscriberId} className={`flex items-start gap-3 p-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/50"}`}>
                        <input type="checkbox" className="mt-1 size-4 accent-primary" checked disabled={disabled} onChange={() => toggleSubscriber(subscriberId)} />
                        <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t("collectionSubscriberAccess.unavailableSubscriber")}</span><span className="block truncate text-xs text-muted-foreground">{subscriberId}</span></span>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4" />{t("collectionSubscriberAccess.groups")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t("collectionSubscriberAccess.groupsDescription")}</p>
              </div>
              <div className="max-h-96 divide-y overflow-y-auto rounded-md border">
                {groups.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">{t("collectionSubscriberAccess.noGroups")}</p>
                ) : groups.map((group) => (
                  <label key={group.group_id} className={`flex items-start gap-3 p-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/50"}`}>
                    <input type="checkbox" className="mt-1 size-4 accent-primary" checked={selectedGroupIds.has(group.group_id)} disabled={disabled} onChange={() => toggleGroup(group.group_id)} />
                    <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{group.name}</span><span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{t("collectionSubscriberAccess.activeCount", { count: group.subscriber_count })}</span></span><span className="mt-1 block text-xs text-muted-foreground">{group.description || t("subscriberGroups.noDescription")}</span></span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        )}

        {!loading && !hasSelections && <div className="rounded-md border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">{t("collectionSubscriberAccess.emptySelection")}</div>}
      </CardContent>
    </Card>
  )
}
