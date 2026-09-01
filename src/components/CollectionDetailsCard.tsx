import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CollectionAccessType } from "@/api/collection"
import type { CollectionDetailsValues } from "@/types/collection"
import { useTranslation } from "react-i18next"

interface CollectionDetailsCardProps {
  values: CollectionDetailsValues
  disabled?: boolean
  showCreateStatus?: boolean
  onChange: (values: CollectionDetailsValues) => void
}

export const CollectionDetailsCard = ({ values, disabled = false, showCreateStatus = false, onChange }: CollectionDetailsCardProps) => {
  const { t } = useTranslation()
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>{t("collections.details")}</CardTitle>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="collection-title">{t("collections.title")}</Label>
          <Input
            id="collection-title"
            value={values.title}
            onChange={(event) => onChange({ ...values, title: event.target.value })}
            placeholder={t("collections.titlePlaceholder")}
            disabled={disabled}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="collection-description">{t("collections.description")}</Label>
          <textarea
            id="collection-description"
            value={values.description}
            onChange={(event) => onChange({ ...values, description: event.target.value })}
            placeholder={t("collections.descriptionPlaceholder")}
            disabled={disabled}
            className="min-h-24 w-full min-w-0 resize-y rounded-md border border-transparent bg-input/50 px-3 py-2 text-sm break-words outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-search-tags">{t("collections.searchTags")}</Label>
          <Input
            id="collection-search-tags"
            value={values.searchTags}
            onChange={(event) => onChange({ ...values, searchTags: event.target.value })}
            placeholder={t("collections.searchTagsPlaceholder")}
            disabled={disabled}
          />
        </div>

        {showCreateStatus && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="collection-status">{t("collectionLifecycle.createStatus")}</Label>
            <select
              id="collection-status"
              value={values.status}
              onChange={(event) => onChange({ ...values, status: event.target.value as "draft" | "published" })}
              disabled={disabled}
              className="h-10 w-full rounded-md border border-transparent bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
            >
              <option value="draft">{t("collectionLifecycle.saveAsDraft")}</option>
              <option value="published">{t("collectionLifecycle.publishOnCreate")}</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {values.status === "published"
                ? t("collectionLifecycle.publishOnCreateHelp")
                : t("collectionLifecycle.draftOnCreateHelp")}
            </p>
          </div>
        )}

        <div className="space-y-3 md:col-span-2">
          <Label>{t("collections.accessType")}</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["public", "premium", "public_org", "grant_org"] as CollectionAccessType[]).map((accessType) => {
              const selected = values.accessType === accessType
              return (
                <button
                  key={accessType}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => onChange({ ...values, accessType })}
                  className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50"}`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold"><span className={`size-3 rounded-full border ${selected ? "border-primary bg-primary ring-2 ring-primary/20" : "border-muted-foreground"}`} />{t(`collectionAccessTypes.label_${accessType}`)}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">{t(`collectionAccessTypes.description_${accessType}`)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection-max-attempts">{t("collections.maxAttempts")}</Label>
          <Input
            id="collection-max-attempts"
            type="number"
            min="0"
            step="1"
            value={values.maxAttempts}
            onChange={(event) => onChange({ ...values, maxAttempts: event.target.value })}
            placeholder={t("collections.maxAttemptsPlaceholder")}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
