import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AlertCircle } from "lucide-react"
import { createCollection, type CreateCollectionResponse } from "@/api/collection"
import { CollectionCreatedDialog } from "@/components/CollectionCreatedDialog"
import { CollectionQuestionsForm } from "@/components/CollectionQuestionsForm"
import { Button } from "@/components/ui/button"
import { collectionSummaryPayload } from "@/lib/collectionForm"
import { useAuthStore } from "@/store/useAuthStore"
import { useCollectionDraftStore } from "@/store/useCollectionDraftStore"

export const CreateCollectionQuestions = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const draft = useCollectionDraftStore((state) => state.draft)
  const clearDraft = useCollectionDraftStore((state) => state.clearDraft)
  const [createdCollectionId, setCreatedCollectionId] = useState<string>()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  if (!draft) {
    return <Navigate to="/collections/create" replace />
  }

  if (activeWorkspaceId && activeWorkspaceId !== draft.orgId) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("collectionFlow.workspaceChanged")}</span>
        </div>
        <Button className="w-fit" onClick={() => navigate("/collections/create", { replace: true })}>
          {t("collectionFlow.backToSummary")}
        </Button>
      </div>
    )
  }

  const handleCreated = (response: CreateCollectionResponse) => {
    setCreatedCollectionId(response.collection_id)
    setSuccessDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setSuccessDialogOpen(open)
    if (!open) {
      clearDraft()
      navigate("/collections", { replace: true })
    }
  }

  return (
    <>
      <CollectionQuestionsForm
        mode="create"
        collectionTitle={draft.summary.title.trim()}
        onBack={() => navigate("/collections/create")}
        onSubmit={(questions) => {
          const summary = collectionSummaryPayload(draft.summary)
          return createCollection({
            ...summary,
            description: summary.description || null,
            org_id: draft.orgId,
            questions,
          })
        }}
        onSuccess={handleCreated}
      />
      <CollectionCreatedDialog
        open={successDialogOpen}
        collectionId={createdCollectionId}
        onOpenChange={handleDialogChange}
      />
    </>
  )
}
