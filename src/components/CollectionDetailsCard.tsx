import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface CollectionDetailsValues {
  title: string
  description: string
  tags: string
  maxAttempts: string
}

interface CollectionDetailsCardProps {
  values: CollectionDetailsValues
  disabled?: boolean
  onChange: (values: CollectionDetailsValues) => void
}

export const CollectionDetailsCard = ({ values, disabled = false, onChange }: CollectionDetailsCardProps) => {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Collection details</CardTitle>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="collection-title">Title</Label>
          <Input
            id="collection-title"
            value={values.title}
            onChange={(event) => onChange({ ...values, title: event.target.value })}
            placeholder="Example: Basic math placement quiz"
            disabled={disabled}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="collection-description">Description</Label>
          <textarea
            id="collection-description"
            value={values.description}
            onChange={(event) => onChange({ ...values, description: event.target.value })}
            placeholder="Describe what this collection is for"
            disabled={disabled}
            className="min-h-24 w-full min-w-0 resize-y rounded-md border border-transparent bg-input/50 px-3 py-2 text-sm break-words outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-tags">Tags, separated by commas</Label>
          <Input
            id="collection-tags"
            value={values.tags}
            onChange={(event) => onChange({ ...values, tags: event.target.value })}
            placeholder="math, grade 7, placement"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-max-attempts">Max attempts</Label>
          <Input
            id="collection-max-attempts"
            type="number"
            min="0"
            step="1"
            value={values.maxAttempts}
            onChange={(event) => onChange({ ...values, maxAttempts: event.target.value })}
            placeholder="0 means no limit"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
