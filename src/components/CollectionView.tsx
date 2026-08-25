import { useEffect, useState } from "react"
import { ArrowLeft, Eye, Tags } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { getCollection, type CollectionData } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export const CollectionView = () => {
  const { collectionId = "" } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!collectionId) return
    void getCollection(collectionId)
      .then(setCollection)
      .catch(() => setError(t("collections.loadFailed")))
      .finally(() => setLoading(false))
  }, [collectionId, t])

  if (loading) return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><Spinner className="mr-2 size-5" />{t("collections.loading")}</div>
  if (error || !collection) return <div className="mx-auto w-full max-w-5xl px-6 py-8"><p className="text-destructive">{error ?? t("collections.notFound")}</p></div>

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
    <Button variant="ghost" className="-ml-2 w-fit" onClick={() => navigate("/collections")}><ArrowLeft className="h-4 w-4" />{t("collections.back")}</Button>
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">{t("collections.eyebrow")}</p><h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1></div>{!collection.can_edit && <span className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground"><Eye className="h-4 w-4" />{t("collections.viewOnly")}</span>}</div>
    <Card><CardHeader><CardTitle>{t("collections.details")}</CardTitle><CardDescription>{collection.description || t("collections.noDescription")}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2">{collection.search_tags?.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"><Tags className="h-3 w-3" />{tag}</span>)}</div><p className="text-sm text-muted-foreground">{t("collections.questionCount", { count: collection.questions.length })}</p></CardContent></Card>
    <div className="space-y-3">{collection.questions.map((question, index) => <Card key={question.id ?? index}><CardContent className="pt-6"><p className="font-medium">{index + 1}. {question.questionText}</p><ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-muted-foreground">{question.options.map((option, optionIndex) => <li key={optionIndex}>{option}</li>)}</ol></CardContent></Card>)}</div>
  </div>
}
