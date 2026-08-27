import type React from "react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { FileUp, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface CollectionQuestionImportCardProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  disabled: boolean
  parsing: boolean
  selectedFileName: string | null
  onFileSelect: (file: File) => void
}

export const CollectionQuestionImportCard = ({
  inputRef,
  disabled,
  parsing,
  selectedFileName,
  onFileSelect,
}: CollectionQuestionImportCardProps) => {
  const { t } = useTranslation()
  const dragDepthRef = useRef(0)
  const [dragging, setDragging] = useState(false)
  const interactionDisabled = disabled || parsing

  const resetDragging = () => {
    dragDepthRef.current = 0
    setDragging(false)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (interactionDisabled) return

    dragDepthRef.current += 1
    setDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (interactionDisabled) return

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    resetDragging()
    if (interactionDisabled) return

    const file = event.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("collectionForm.importTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          id="collection-import-file"
          type="file"
          accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFileSelect(file)
          }}
          disabled={interactionDisabled}
          className="sr-only"
          tabIndex={-1}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={(event) => {
            event.preventDefault()
            if (!interactionDisabled) event.dataTransfer.dropEffect = "copy"
          }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={interactionDisabled}
          aria-describedby="collection-import-help"
          className={cn(
            "group flex min-h-52 w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-8 text-center outline-none transition-[border-color,background-color,box-shadow,transform]",
            "border-border bg-muted/20 hover:border-primary/60 hover:bg-primary/5 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
            dragging && "scale-[1.01] border-primary bg-primary/10 shadow-sm",
            interactionDisabled && "pointer-events-none opacity-60"
          )}
        >
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105",
              dragging && "scale-110 bg-primary text-primary-foreground"
            )}
          >
            <Upload className="size-7" />
          </span>

          <span className="space-y-1">
            <span className="block text-base font-semibold text-foreground">
              {dragging ? t("collectionImportDrop.dropNow") : t("collectionImportDrop.dropHere")}
            </span>
            <span className="block text-sm text-muted-foreground">
              {t("collectionImportDrop.orChoose")}
            </span>
          </span>

          <span className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm">
            {t("collectionImportDrop.chooseFile")}
          </span>

          <span id="collection-import-help" className="text-xs text-muted-foreground">
            {t("collectionImportDrop.supportedFiles")}
          </span>
        </button>

        {parsing && (
          <div className="flex items-center justify-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground" role="status">
            <Spinner className="size-4" />
            {t("collectionForm.readingFile")}
          </div>
        )}

        {selectedFileName && !parsing && (
          <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <FileUp className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{t("collectionForm.loaded", { name: selectedFileName })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
