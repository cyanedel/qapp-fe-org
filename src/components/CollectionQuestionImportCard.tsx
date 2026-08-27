import type React from "react"
import { useTranslation } from "react-i18next"
import { FileUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

interface CollectionQuestionImportCardProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  disabled: boolean
  parsing: boolean
  selectedFileName: string | null
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const CollectionQuestionImportCard = ({
  inputRef,
  disabled,
  parsing,
  selectedFileName,
  onFileChange,
}: CollectionQuestionImportCardProps) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("collectionForm.importTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="collection-import-file">{t("collectionForm.questionFile")}</Label>
          <input
            ref={inputRef}
            id="collection-import-file"
            type="file"
            accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onFileChange}
            disabled={disabled || parsing}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">{t("collectionForm.importHelp")}</p>
        </div>

        {parsing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Spinner className="size-4" />
            {t("collectionForm.readingFile")}
          </div>
        )}

        {selectedFileName && !parsing && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <FileUp className="h-4 w-4 text-primary" />
            <span className="truncate">{t("collectionForm.loaded", { name: selectedFileName })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
