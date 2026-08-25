import { CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CollectionCreatedDialogProps {
  open: boolean
  collectionId?: string
  onOpenChange: (open: boolean) => void
}

export const CollectionCreatedDialog = ({ open, collectionId, onOpenChange }: CollectionCreatedDialogProps) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <DialogTitle>{t("collections.created")}</DialogTitle>
          <DialogDescription>
            {t("collections.createdDescription")}
            {collectionId ? ` ${t("collections.collectionId", { id: collectionId })}` : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t("collections.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
