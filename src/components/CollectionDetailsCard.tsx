import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CollectionAccessType } from "@/api/collection"

export interface CollectionDetailsValues {
  title: string
  description: string
  searchTags: string
  accessType: CollectionAccessType
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
          <Label htmlFor="collection-search-tags">Search tags, separated by commas</Label>
          <Input
            id="collection-search-tags"
            value={values.searchTags}
            onChange={(event) => onChange({ ...values, searchTags: event.target.value })}
            placeholder="math, grade 7, placement"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-access-type">Access type</Label>
          <select
            id="collection-access-type"
            value={values.accessType}
            onChange={(event) => onChange({ ...values, accessType: event.target.value as CollectionAccessType })}
            disabled={disabled}
            className="h-10 w-full rounded-md border border-transparent bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
          >
            <option value="public">Public</option>
            <option value="premium">Premium</option>
            <option value="public_org">Organization members</option>
            <option value="grant_org">Organization grant</option>
          </select>
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
