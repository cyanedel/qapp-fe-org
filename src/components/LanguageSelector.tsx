import { Check, ChevronDown, Languages } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface LanguageSelectorProps {
  className?: string
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language
  const languages = ["en", "id", "ko", "zh-CN"] as const

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex h-9 items-center gap-2 rounded-lg border border-amber-900/15 bg-[#FFF4CC]/95 px-3 text-sm font-medium text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-[#FFEDB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=open]:bg-[#FFEDB8] dark:border-border dark:bg-card/95 dark:hover:bg-muted dark:data-[state=open]:bg-muted",
            className,
          )}
        >
          <Languages className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{t(`languages.${currentLanguage}`)}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
          <span className="sr-only">{t("languageSelector.label")}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 overflow-hidden rounded-lg border border-amber-900/15 bg-[#FFF8E7] p-1 text-foreground shadow-xl shadow-amber-950/15 outline-none dark:border-border dark:bg-popover dark:shadow-black/30"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {t("languageSelector.label")}
          </DropdownMenu.Label>
          {languages.map((language) => (
            <DropdownMenu.Item
              key={language}
              onSelect={() => void i18n.changeLanguage(language)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-amber-900/10 data-[highlighted]:text-foreground"
            >
              <span className="flex-1">{t(`languages.${language}`)}</span>
              {currentLanguage === language && <Check className="h-4 w-4 text-primary" aria-label={t("languageSelector.selected")} />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
