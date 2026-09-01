import type React from "react"
import { useTranslation } from "react-i18next"
import { Tags } from "lucide-react"
import type { CollectionData } from "@/api/collection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CollectionSummaryViewProps {
  collection: CollectionData
}

export const CollectionSummaryView = ({ collection }: CollectionSummaryViewProps) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("collections.details")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        <SummaryField label={t("collections.description")} className="md:col-span-2">
          {collection.description || t("collections.noDescription")}
        </SummaryField>

        <SummaryField label={t("collections.accessType")}>
          {t(`collectionAccessTypes.label_${collection.access_type}`)}
        </SummaryField>

        <SummaryField label={t("collections.maxAttempts")}>
          {collection.max_attempts === 0 || collection.max_attempts == null
            ? t("collectionFlow.unlimitedAttempts")
            : collection.max_attempts}
        </SummaryField>

        <SummaryField label={t("collections.searchTags")} className="md:col-span-2">
          {collection.search_tags && collection.search_tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {collection.search_tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"
                >
                  <Tags className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            t("collectionFlow.noSearchTags")
          )}
        </SummaryField>

        <SummaryField label={t("collectionFlow.questions")} className="md:col-span-2">
          {t("collections.questionCount", { count: collection.questions.length })}
        </SummaryField>
      </CardContent>
    </Card>
  )
}

const SummaryField = ({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) => (
  <div className={`space-y-1 ${className}`}>
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="text-sm text-foreground">{children}</div>
  </div>
)
