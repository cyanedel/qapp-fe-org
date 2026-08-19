import type React from "react"
import { useMemo, useRef, useState } from "react"
import { AlertCircle, FileUp, Upload } from "lucide-react"
import { createCollectionFromFile } from "@/api/collection"
import { CollectionCreatedDialog } from "@/components/CollectionCreatedDialog"
import { CollectionDetailsCard, type CollectionDetailsValues } from "@/components/CollectionDetailsCard"
import { OperationOverlay } from "@/components/OperationOverlay"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"

const maxImportFileSize = 10 * 1024 * 1024

export const CollectionImport = () => {
  const user = useAuthStore((state) => state.user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [details, setDetails] = useState<CollectionDetailsValues>({
    title: "",
    description: "",
    tags: "",
    maxAttempts: "0",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdCollectionId, setCreatedCollectionId] = useState<string | undefined>()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const parsedTags = useMemo(
    () =>
      details.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [details.tags]
  )
  const workspaceId = user?.org?.[0]?.org_id || user?.org_id?.[0] || ""

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setError(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx")) {
      setSelectedFile(null)
      setError("Choose a CSV or Excel (.xlsx) file.")
      return
    }

    if (file.size > maxImportFileSize) {
      setSelectedFile(null)
      setError("The question file must be smaller than 10 MB.")
      return
    }

    setSelectedFile(file)
  }

  const validateForm = () => {
    if (!details.title.trim()) return "Collection title is required."
    if (!workspaceId) return "A workspace is required to create a collection."
    if (!selectedFile) return "Choose a CSV or Excel question file."

    const maxAttemptsNumber = Number(details.maxAttempts)
    if (!Number.isInteger(maxAttemptsNumber) || maxAttemptsNumber < 0) {
      return "Max attempts must be a whole number of 0 or greater."
    }

    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessDialogOpen(false)

    const validationError = validateForm()
    if (validationError || !selectedFile) {
      setError(validationError ?? "Choose a CSV or Excel question file.")
      return
    }

    setLoading(true)

    try {
      const response = await createCollectionFromFile({
        org_id: workspaceId,
        title: details.title.trim(),
        description: details.description.trim() || null,
        tags: parsedTags,
        max_attempts: Number(details.maxAttempts),
        questionsFile: selectedFile,
      })

      setCreatedCollectionId(response.collection_id)
      setSuccessDialogOpen(true)
      setDetails({ title: "", description: "", tags: "", maxAttempts: "0" })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import collection."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 overflow-x-hidden px-6 py-8">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-primary">Collections</p>
          <h1 className="text-3xl font-bold tracking-tight">Import collection</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Enter the collection details and upload a CSV or Excel file containing the question list.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
          <CollectionDetailsCard values={details} onChange={setDetails} disabled={loading} />

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="questions-file">Question list file</Label>
                <input
                  ref={fileInputRef}
                  id="questions-file"
                  type="file"
                  accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: CSV and Excel (.xlsx), maximum size 10 MB.
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <FileUp className="h-4 w-4 text-primary" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Collection
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <OperationOverlay open={loading} message="Importing collection..." />
      <CollectionCreatedDialog
        open={successDialogOpen}
        collectionId={createdCollectionId}
        onOpenChange={setSuccessDialogOpen}
      />
    </>
  )
}
