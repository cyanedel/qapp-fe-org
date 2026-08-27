import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AlertCircle } from "lucide-react"
import {
  getCollection,
  updateCollectionQuestions,
  type CollectionEditData,
  type CollectionData,
} from "@/api/collection"
import { CollectionQuestionsForm } from "@/components/CollectionQuestionsForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export const EditCollectionQuestions = () => {
  const { t } = useTranslation()
  const { collectionId = "" } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<CollectionEditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCollection = async () => {
      if (!collectionId) {
        setError(t("collections.notFound"))
        setLoading(false)
        return
      }

      try {
        const data = await getCollection(collectionId)
        if (!data.can_edit) {
          navigate(`/collections/${collectionId}/questions`, { replace: true })
          return
        }
        if (!hasEditableQuestions(data)) {
          throw new Error("Editable collection response did not include correct answers")
        }
        if (isMounted) setCollection(data)
      } catch {
        if (isMounted) setError(t("collections.loadFailed"))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadCollection()
    return () => {
      isMounted = false
    }
  }, [collectionId, navigate, t])

  if (loading) {
    return (
      <Card className="mx-auto mt-8 max-w-5xl">
        <CardContent className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
          <Spinner className="mr-2 size-5" />
          {t("collections.loading")}
        </CardContent>
      </Card>
    )
  }

  if (error || !collection) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error ?? t("collections.notFound")}</span>
        </div>
        <Button className="w-fit" variant="outline" onClick={() => navigate("/collections", { replace: true })}>
          {t("collections.back")}
        </Button>
      </div>
    )
  }

  return (
    <CollectionQuestionsForm
      key={collection.collection_id}
      mode="edit"
      collectionTitle={collection.title}
      initialQuestions={collection.questions}
      onBack={() => navigate(`/collections/${collection.collection_id}/edit`)}
      onSubmit={(questions) => updateCollectionQuestions(collection.collection_id, { questions })}
      onSuccess={() => navigate(`/collections/${collection.collection_id}/edit`, { replace: true })}
    />
  )
}

const hasEditableQuestions = (collection: CollectionData): collection is CollectionEditData =>
  collection.questions.every((question) => typeof question.correctAnswer === "number")
