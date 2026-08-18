import { useEffect, useState } from "react"
import { AlertCircle, FolderPlus, Tags } from "lucide-react"
import { Link } from "react-router-dom"
import { getCollectionList, type CollectionSummary } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export const CollectionList = () => {
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCollections = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getCollectionList()
        if (isMounted) {
          setCollections(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load collections.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Collections</p>
          <h1 className="text-3xl font-bold tracking-tight">List collections</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Browse existing question collections.
          </p>
        </div>

        <Button asChild size="lg">
          <Link to="/collections/create">
            <FolderPlus className="h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">
            <Spinner className="mr-2 size-5" />
            Loading collections...
          </CardContent>
        </Card>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">
            No collections found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <Card key={collection.collectionid} className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{collection.title}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {collection.description || "No description."}
                  </p>
                </div>

                {collection.tags && collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collection.tags.map((tag, index) => (
                      <span
                        key={`${collection.collectionid}-${tag}-${index}`}
                        className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <Tags className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
