import { Spinner } from "@/components/ui/spinner"
import { useTranslation } from "react-i18next"

interface OperationOverlayProps {
  open: boolean
  message?: string
}

export const OperationOverlay = ({ open, message }: OperationOverlayProps) => {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg">
        <Spinner className="size-4" />
        <span>{message ?? t("collections.working")}</span>
      </div>
    </div>
  )
}
