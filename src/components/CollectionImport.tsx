import { FileUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const CollectionImport = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Collections</p>
        <h1 className="text-3xl font-bold tracking-tight">Import collection</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Import support for CSV, JSON, and Excel files will be connected when the endpoint is ready.
        </p>
      </div>

      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <FileUp className="h-6 w-6" />
          </span>
          Import Collection is not available yet.
        </CardContent>
      </Card>
    </div>
  )
}
