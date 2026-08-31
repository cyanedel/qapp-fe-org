import { useState } from "react"
import { Archive, FilePenLine, Globe2, RotateCcw } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { CollectionStatus } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

interface CollectionLifecycleCardProps {
  status: CollectionStatus
  loading: boolean
  onChange: (status: CollectionStatus) => Promise<void>
}

export const CollectionLifecycleCard = ({ status, loading, onChange }: CollectionLifecycleCardProps) => {
  const { t } = useTranslation()
  const [pendingStatus, setPendingStatus] = useState<CollectionStatus | null>(null)

  const requestChange = (nextStatus: CollectionStatus) => {
    if (nextStatus === "archived" || (status === "published" && nextStatus === "draft")) {
      setPendingStatus(nextStatus)
      return
    }
    void onChange(nextStatus)
  }

  const confirmChange = async () => {
    if (!pendingStatus) return
    const nextStatus = pendingStatus
    setPendingStatus(null)
    await onChange(nextStatus)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>{t("collectionLifecycle.title")}</CardTitle>
              <CardDescription>{t(`collectionLifecycle.description_${status}`)}</CardDescription>
            </div>
            <span className="inline-flex w-fit rounded-full border bg-muted px-3 py-1 text-xs font-semibold">
              {t(`collectionLifecycle.status_${status}`)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {status === "draft" && (
            <Button type="button" onClick={() => requestChange("published")} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : <Globe2 className="h-4 w-4" />}
              {t("collectionLifecycle.publish")}
            </Button>
          )}
          {status === "published" && (
            <Button type="button" variant="outline" onClick={() => requestChange("draft")} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : <FilePenLine className="h-4 w-4" />}
              {t("collectionLifecycle.returnToDraft")}
            </Button>
          )}
          {status === "archived" ? (
            <Button type="button" onClick={() => requestChange("draft")} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : <RotateCcw className="h-4 w-4" />}
              {t("collectionLifecycle.restore")}
            </Button>
          ) : (
            <Button type="button" variant="destructive" onClick={() => requestChange("archived")} disabled={loading}>
              <Archive className="h-4 w-4" />
              {t("collectionLifecycle.archive")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={pendingStatus !== null} onOpenChange={(open) => !open && !loading && setPendingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingStatus === "archived"
                ? t("collectionLifecycle.archiveConfirmTitle")
                : t("collectionLifecycle.draftConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {pendingStatus === "archived"
                ? t("collectionLifecycle.archiveConfirmDescription")
                : t("collectionLifecycle.draftConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingStatus(null)} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant={pendingStatus === "archived" ? "destructive" : "default"}
              onClick={() => void confirmChange()}
              disabled={loading}
            >
              {pendingStatus === "archived"
                ? t("collectionLifecycle.archive")
                : t("collectionLifecycle.returnToDraft")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
