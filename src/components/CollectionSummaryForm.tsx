import { useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, ArrowRight, Save } from "lucide-react"
import { CollectionDetailsCard } from "@/components/CollectionDetailsCard"
import { OperationOverlay } from "@/components/OperationOverlay"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { collectionSummaryFingerprint } from "@/lib/collectionForm"
import type { CollectionDetailsValues } from "@/types/collection"

interface CollectionSummaryFormProps {
  mode: "create" | "edit"
  initialValues: CollectionDetailsValues
  validate?: (values: CollectionDetailsValues) => string | null
  onSave?: (values: CollectionDetailsValues) => Promise<void>
  onQuestions: (values: CollectionDetailsValues) => void
  disabled?: boolean
  beforeDetails?: ReactNode
}

export const CollectionSummaryForm = ({
  mode,
  initialValues,
  validate,
  onSave,
  onQuestions,
  disabled = false,
  beforeDetails,
}: CollectionSummaryFormProps) => {
  const { t } = useTranslation()
  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const isDirty = collectionSummaryFingerprint(values) !== collectionSummaryFingerprint(savedValues)

  const validateSummary = () => {
    if (!values.title.trim()) return t("collectionFormExtras.titleRequired")

    const maxAttempts = Number(values.maxAttempts)
    if (!Number.isInteger(maxAttempts) || maxAttempts < 0) {
      return t("collectionFormExtras.attemptsInvalid")
    }

    return validate?.(values) ?? null
  }

  const continueCreate = () => {
    setError(null)
    const validationError = validateSummary()
    if (validationError) {
      setError(validationError)
      return
    }
    onQuestions(values)
  }

  const saveChanges = async () => {
    if (mode !== "edit" || disabled || !isDirty || !onSave) return

    setError(null)
    setSaved(false)
    const validationError = validateSummary()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      await onSave(values)
      setSavedValues(values)
      setSaved(true)
    } catch {
      setError(t("collectionFormExtras.saveFailed"))
    } finally {
      setLoading(false)
    }
  }

  const openQuestions = () => {
    if (isDirty) {
      setUnsavedDialogOpen(true)
      return
    }
    onQuestions(values)
  }

  const continueWithoutSaving = () => {
    setUnsavedDialogOpen(false)
    onQuestions(savedValues)
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 px-6 py-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{t("collections.eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? t("collectionFlow.createSummaryTitle") : t("collectionFlow.editSummaryTitle")}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("collectionFlow.summaryDescription")}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {t("collectionFlow.summarySaved")}
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (mode === "create") {
              continueCreate()
            } else {
              void saveChanges()
            }
          }}
        >
          {beforeDetails}

          <CollectionDetailsCard
            values={values}
            onChange={(nextValues) => {
              setValues(nextValues)
              setSaved(false)
            }}
            disabled={loading || disabled}
            showCreateStatus={mode === "create"}
          />

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            {mode === "edit" && (
              <Button type="submit" variant="outline" size="lg" disabled={loading || disabled || !isDirty}>
                {loading ? <Spinner className="mr-2 size-4" /> : <Save className="h-4 w-4" />}
                {t("collectionFlow.saveChanges")}
              </Button>
            )}

            <Button
              type={mode === "create" ? "submit" : "button"}
              size="lg"
              disabled={loading || disabled}
              onClick={mode === "edit" ? openQuestions : undefined}
            >
              <ArrowRight className="h-4 w-4" />
              {mode === "create"
                ? t("collectionFlow.continueToQuestions")
                : t("collectionFlow.editQuestions")}
            </Button>
          </div>
        </form>
      </div>

      <OperationOverlay open={loading} message={t("collectionFormExtras.savingOverlay")} />

      <Dialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("collectionFlow.unsavedChangesTitle")}</DialogTitle>
            <DialogDescription>{t("collectionFlow.unsavedChangesDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnsavedDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={continueWithoutSaving}>
              {t("collectionFlow.continueWithoutSaving")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
