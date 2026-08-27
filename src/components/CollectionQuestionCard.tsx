import { useTranslation } from "react-i18next"
import { ChevronDown, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CollectionQuestionFormValues } from "@/types/collection"

interface CollectionQuestionCardProps {
  question: CollectionQuestionFormValues
  questionIndex: number
  questionCount: number
  collapsed: boolean
  disabled: boolean
  onToggle: () => void
  onRemove: () => void
  onQuestionChange: (value: string) => void
  onOptionChange: (optionIndex: number, value: string) => void
  onCorrectAnswerChange: (optionIndex: number) => void
}

export const CollectionQuestionCard = ({
  question,
  questionIndex,
  questionCount,
  collapsed,
  disabled,
  onToggle,
  onRemove,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
}: CollectionQuestionCardProps) => {
  const { t } = useTranslation()
  const questionNumber = questionIndex + 1

  return (
    <div className="question-sortable-item min-w-0 max-w-full overflow-hidden">
      <Card className="min-w-0 max-w-full overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <span
              className="question-drag-handle flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
              role="button"
              aria-label={t("collectionFormExtras.dragQuestion", { number: questionNumber })}
              title={t("collectionFormExtras.dragQuestion", { number: questionNumber })}
              tabIndex={0}
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <button
              type="button"
              onClick={onToggle}
              className="flex min-w-0 flex-1 items-start gap-2 text-left"
              aria-expanded={!collapsed}
              aria-controls={`question-panel-${question.id}`}
            >
              <ChevronDown
                className={`mt-1 h-4 w-4 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`}
              />
              <span className="min-w-0 flex-1 overflow-hidden">
                <CardTitle className="text-base leading-snug">
                  {t("collectionForm.question", { number: questionNumber })}
                </CardTitle>
                {question.questionText.trim() && (
                  <span className="mt-1 block max-w-full whitespace-normal text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                    {question.questionText.trim()}
                  </span>
                )}
              </span>
            </button>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onRemove}
            disabled={disabled || questionCount === 1}
            aria-label={t("collectionFormExtras.removeQuestion", { number: questionNumber })}
            title={t("collectionFormExtras.removeQuestion", { number: questionNumber })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent
          id={`question-panel-${question.id}`}
          className={`min-w-0 space-y-4 overflow-hidden ${collapsed ? "hidden" : ""}`}
        >
          <div className="space-y-2">
            <Label htmlFor={`question-${question.id}`}>{t("collectionForm.questionText")}</Label>
            <textarea
              id={`question-${question.id}`}
              value={question.questionText}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder={t("collectionForm.questionPlaceholder")}
              disabled={disabled}
              wrap="soft"
              className="min-h-24 w-full min-w-0 resize-y overflow-x-hidden rounded-md border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-pre-wrap break-words outline-none transition-[color,box-shadow,background-color] [overflow-wrap:anywhere] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="min-w-0 space-y-2 overflow-hidden rounded-lg border bg-background p-3"
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <input
                    type="radio"
                    name={`correct-answer-${question.id}`}
                    checked={question.correctAnswer === optionIndex + 1}
                    onChange={() => onCorrectAnswerChange(optionIndex + 1)}
                    className="h-4 w-4 accent-primary"
                    disabled={disabled}
                  />
                  {t("collectionForm.correctOption", { number: optionIndex + 1 })}
                </span>
                <Input
                  value={option}
                  onChange={(event) => onOptionChange(optionIndex, event.target.value)}
                  placeholder={t("collectionForm.option", { number: optionIndex + 1 })}
                  disabled={disabled}
                  required
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
