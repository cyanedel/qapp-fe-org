import { useEffect, useState } from "react"
import { ArrowLeft, Eye, Pencil } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { getCollection, type CollectionData } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export const CollectionQuestionsView = () => {
  const { collectionId = "" } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!collectionId) {
      setError(t("collections.notFound"))
      setLoading(false)
      return
    }

    void getCollection(collectionId)
      .then(setCollection)
      .catch(() => setError(t("collections.loadFailed")))
      .finally(() => setLoading(false))
  }, [collectionId, t])

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        <Spinner className="mr-2 size-5" />
        {t("collections.loading")}
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <p className="text-destructive">{error ?? t("collections.notFound")}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <Button
        variant="ghost"
        className="-ml-2 w-fit"
        onClick={() => navigate(`/collections/${collection.collection_id}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("collectionFlow.backToSummary")}
      </Button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-primary">{t("collections.eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t("collectionFlow.questionsFor", { title: collection.title })}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("collections.questionCount", { count: collection.questions.length })}
          </p>
        </div>
        {!collection.can_edit && (
          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {t("collections.viewOnly")}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {collection.questions.map((question, index) => (
          <Card key={question.id ?? index}>
            <CardContent className="pt-6">
              <p className="font-medium">
                {index + 1}. {question.questionText}
              </p>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex}>{option}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      {collection.can_edit && collection.status !== "archived" && (
        <Button
          className="self-end"
          onClick={() => navigate(`/collections/${collection.collection_id}/edit/questions`)}
        >
          <Pencil className="h-4 w-4" />
          {t("collectionFlow.editQuestions")}
        </Button>
      )}
    </div>
  )
}
