import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CollectionForm } from "@/components/CreateCollection"
import { getCollection, updateCollection, type CollectionEditData } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export const EditCollection = () => {
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
          navigate(`/collections/${collectionId}`, { replace: true })
          return
        }
        if (isMounted) setCollection(data as CollectionEditData)
      } catch (err) {
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
        <div>
          <Button variant="outline" onClick={() => navigate("/collections", { replace: true })}>
            {t("collections.back")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CollectionForm
      key={collection.collection_id}
      mode="edit"
      initialCollection={collection}
      onSubmit={(payload) => updateCollection(collection.collection_id, payload)}
      onSuccess={() => navigate("/collections", { replace: true })}
    />
  )
}
