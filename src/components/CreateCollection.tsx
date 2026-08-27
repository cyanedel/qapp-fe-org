import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CollectionSummaryForm } from "@/components/CollectionSummaryForm"
import { emptyCollectionDetails } from "@/lib/collectionForm"
import { useAuthStore } from "@/store/useAuthStore"
import { useCollectionDraftStore } from "@/store/useCollectionDraftStore"

export const CreateCollection = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const draft = useCollectionDraftStore((state) => state.draft)
  const saveSummary = useCollectionDraftStore((state) => state.saveSummary)
  const workspaceId = activeWorkspaceId || user?.org?.[0]?.org_id || user?.org_id?.[0] || ""

  return (
    <CollectionSummaryForm
      mode="create"
      initialValues={draft?.summary ?? emptyCollectionDetails()}
      validate={() => (workspaceId ? null : t("collectionFormExtras.workspaceRequired"))}
      onQuestions={(values) => {
        saveSummary(values, workspaceId)
        navigate("/collections/create/questions")
      }}
    />
  )
}
