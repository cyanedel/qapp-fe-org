import { useEffect, useState } from "react"
import { AlertCircle, Ellipsis, FolderPlus, Pencil, Tags, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { deleteCollection, getOrgCollectionList, type CollectionSummary } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthStore } from "@/store/useAuthStore"

export const CollectionList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collectionPendingDelete, setCollectionPendingDelete] = useState<CollectionSummary | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [collectionMenuOpen, setCollectionMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCollections = async () => {
      setLoading(true)
      setError(null)

      if (!activeWorkspaceId) {
        setCollections([])
        setError(t("sidebar.noWorkspace"))
        setLoading(false)
        return
      }

      try {
        const data = await getOrgCollectionList(activeWorkspaceId)
        if (isMounted) {
          setCollections(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(t("collections.loadFailed"))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [activeWorkspaceId, t])

  const editableCollections = collections.filter((collection) => collection.can_edit)

  const handleDelete = async () => {
    if (!collectionPendingDelete) return

    setDeleting(true)
    setError(null)
    try {
      await deleteCollection(collectionPendingDelete.collectionid)
      setCollections((currentCollections) =>
        currentCollections.filter((collection) => collection.collectionid !== collectionPendingDelete.collectionid)
      )
      setCollectionPendingDelete(null)
    } catch (err) {
      setError(t("collections.loadFailed"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{t("collections.eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t("collections.listTitle")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("collections.listDescription")}
          </p>
        </div>

        <Button asChild size="lg">
          <Link to="/collections/create">
            <FolderPlus className="h-4 w-4" />
            {t("collections.createNew")}
          </Link>
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">
            <Spinner className="mr-2 size-5" />
            {t("collections.loading")}
          </CardContent>
        </Card>
      ) : editableCollections.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">
            {t("collections.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {editableCollections.map((collection) => (
            <Card
              key={collection.collectionid}
              className="group relative cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/collections/${collection.collectionid}/edit`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  navigate(`/collections/${collection.collectionid}/edit`)
                }
              }}
              aria-label={t("collections.edit", { title: collection.title })}
            >
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2 pr-10">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{collection.title}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {collection.description || t("collections.noDescription")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md border bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {t(`collections.${collection.access_type || "public"}`)}
                  </span>
                </div>

                {collection.search_tags && collection.search_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collection.search_tags.map((tag, index) => (
                      <span
                        key={`${collection.collectionid}-${tag}-${index}`}
                        className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <Tags className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="absolute right-3 top-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                  data-state={collectionMenuOpen === collection.collectionid ? "open" : "closed"}
                  aria-label={t("collections.edit", { title: collection.title })}
                  aria-expanded={collectionMenuOpen === collection.collectionid}
                  onClick={(event) => {
                    event.stopPropagation()
                    setCollectionMenuOpen((current) => (current === collection.collectionid ? null : collection.collectionid))
                  }}
                >
                  <Ellipsis className="h-5 w-5" />
                </Button>
                {collectionMenuOpen === collection.collectionid && (
                  <div
                    role="menu"
                    className="absolute right-0 top-9 z-10 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                      onClick={() => navigate(`/collections/${collection.collectionid}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      {t("collections.edit")}
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none"
                      onClick={() => {
                        setCollectionMenuOpen(null)
                        setCollectionPendingDelete(collection)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("collections.remove")}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={collectionPendingDelete !== null} onOpenChange={(open) => !open && !deleting && setCollectionPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("collections.removeTitle")}</DialogTitle>
            <DialogDescription>
              {collectionPendingDelete ? t("collections.removeDescription", { title: collectionPendingDelete.title }) : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectionPendingDelete(null)} disabled={deleting}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? t("collections.removing") : t("collections.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
