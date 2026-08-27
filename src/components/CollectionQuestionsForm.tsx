import type React from "react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ReactSortable } from "react-sortablejs"
import { AlertCircle, ArrowLeft, Plus, Save } from "lucide-react"
import type {
  CreateCollectionResponse,
  CreateQuestionItem,
  EditableCollectionQuestion,
} from "@/api/collection"
import { CollectionQuestionCard } from "@/components/CollectionQuestionCard"
import { CollectionQuestionImportCard } from "@/components/CollectionQuestionImportCard"
import { Button } from "@/components/ui/button"
import { OperationOverlay } from "@/components/OperationOverlay"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { isSupportedCollectionImport, parseCollectionImport } from "@/lib/collectionImport"
import {
  createBlankQuestion,
  questionFormsFromData,
  questionPayloadFromForms,
} from "@/lib/collectionForm"
import type { CollectionQuestionFormValues } from "@/types/collection"

interface CollectionQuestionsFormProps {
  mode: "create" | "edit"
  collectionTitle: string
  initialQuestions?: EditableCollectionQuestion[]
  onBack: () => void
  onSubmit: (questions: CreateQuestionItem[]) => Promise<CreateCollectionResponse>
  onSuccess: (response: CreateCollectionResponse) => void
}

export const CollectionQuestionsForm = ({
  mode,
  collectionTitle,
  initialQuestions = [],
  onBack,
  onSubmit,
  onSuccess,
}: CollectionQuestionsFormProps) => {
  const { t } = useTranslation()
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [questions, setQuestions] = useState<CollectionQuestionFormValues[]>(() =>
    questionFormsFromData(initialQuestions)
  )
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [parsingImport, setParsingImport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImportFileName, setSelectedImportFileName] = useState<string | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [importWarningOpen, setImportWarningOpen] = useState(false)

  const hasQuestionContent = questions.some(
    (question) => question.questionText.trim() || question.options.some((option) => option.trim())
  )

  const updateQuestion = (questionIndex: number, value: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex ? { ...question, questionText: value } : question
      )
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => {
        if (index !== questionIndex) return question

        const nextOptions = [...question.options]
        nextOptions[optionIndex] = value
        return { ...question, options: nextOptions }
      })
    )
  }

  const updateCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex ? { ...question, correctAnswer: optionIndex } : question
      )
    )
  }

  const removeQuestion = (questionIndex: number) => {
    setQuestions((currentQuestions) => {
      const removedQuestion = currentQuestions[questionIndex]
      if (removedQuestion) {
        setCollapsedQuestionIds((currentIds) =>
          currentIds.filter((questionId) => questionId !== removedQuestion.id)
        )
      }
      return currentQuestions.filter((_, index) => index !== questionIndex)
    })
  }

  const toggleQuestionCollapsed = (questionId: string) => {
    setCollapsedQuestionIds((currentIds) =>
      currentIds.includes(questionId)
        ? currentIds.filter((currentId) => currentId !== questionId)
        : [...currentIds, questionId]
    )
  }

  const applyImportedQuestions = async (file: File) => {
    setError(null)
    setParsingImport(true)

    try {
      const importedQuestions = await parseCollectionImport(file)
      setQuestions(
        importedQuestions.map((question) => ({
          ...question,
          id: crypto.randomUUID(),
        }))
      )
      setCollapsedQuestionIds([])
      setSelectedImportFileName(file.name)
    } catch {
      setError(t("collectionFormExtras.parseFailed"))
    } finally {
      setParsingImport(false)
    }
  }

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) return

    setError(null)
    if (!isSupportedCollectionImport(file.name)) {
      setError(t("collectionFormExtras.invalidFile"))
      event.target.value = ""
      return
    }

    if (hasQuestionContent) {
      setPendingImportFile(file)
      setImportWarningOpen(true)
      return
    }

    void applyImportedQuestions(file)
  }

  const handleImportWarningChange = (open: boolean) => {
    setImportWarningOpen(open)
    if (!open) {
      setPendingImportFile(null)
      if (importFileInputRef.current) importFileInputRef.current.value = ""
    }
  }

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return

    const file = pendingImportFile
    setPendingImportFile(null)
    setImportWarningOpen(false)
    await applyImportedQuestions(file)
  }

  const validateQuestions = () => {
    if (questions.length === 0) return t("collectionFormExtras.questionRequired")

    const invalidQuestionIndex = questions.findIndex(
      (question) => !question.questionText.trim() || question.options.some((option) => !option.trim())
    )
    return invalidQuestionIndex >= 0
      ? t("collectionFormValidation.questionIncomplete", { number: invalidQuestionIndex + 1 })
      : null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const validationError = validateQuestions()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const response = await onSubmit(questionPayloadFromForms(questions))
      onSuccess(response)
    } catch {
      setError(t("collectionFormExtras.saveFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 overflow-x-hidden px-6 py-8">
        <Button type="button" variant="ghost" className="-ml-2 w-fit" onClick={onBack} disabled={loading}>
          <ArrowLeft className="h-4 w-4" />
          {t("collectionFlow.backToSummary")}
        </Button>

        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-primary">{t("collections.eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? t("collectionFlow.createQuestionsTitle") : t("collectionFlow.editQuestionsTitle")}
          </h1>
          <p className="text-base font-semibold text-foreground">
            {t("collectionFlow.collectionTitle", { title: collectionTitle })}
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("collectionFlow.questionsDescription")}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="min-w-0 space-y-6 overflow-x-hidden">
          <CollectionQuestionImportCard
            inputRef={importFileInputRef}
            disabled={loading}
            parsing={parsingImport}
            selectedFileName={selectedImportFileName}
            onFileChange={handleImportFileChange}
          />

          <ReactSortable<CollectionQuestionFormValues>
            list={questions}
            setList={setQuestions}
            animation={180}
            easing="cubic-bezier(0.2, 0, 0, 1)"
            handle=".question-drag-handle"
            draggable=".question-sortable-item"
            ghostClass="question-sortable-ghost"
            chosenClass="question-sortable-chosen"
            dragClass="question-sortable-drag"
            disabled={loading}
            className="min-w-0 space-y-4 overflow-x-hidden"
          >
            {questions.map((question, questionIndex) => (
              <CollectionQuestionCard
                key={question.id}
                question={question}
                questionIndex={questionIndex}
                questionCount={questions.length}
                collapsed={collapsedQuestionIds.includes(question.id)}
                disabled={loading}
                onToggle={() => toggleQuestionCollapsed(question.id)}
                onRemove={() => removeQuestion(questionIndex)}
                onQuestionChange={(value) => updateQuestion(questionIndex, value)}
                onOptionChange={(optionIndex, value) => updateOption(questionIndex, optionIndex, value)}
                onCorrectAnswerChange={(optionIndex) => updateCorrectAnswer(questionIndex, optionIndex)}
              />
            ))}
          </ReactSortable>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setQuestions((current) => [...current, createBlankQuestion()])}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              {t("collectionForm.addQuestion")}
            </Button>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  {mode === "create" ? t("collectionForm.creating") : t("collectionForm.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === "create" ? t("collectionForm.create") : t("collectionFlow.saveQuestions")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <OperationOverlay
        open={loading}
        message={
          mode === "create"
            ? t("collectionFormExtras.creatingOverlay")
            : t("collectionFormExtras.savingOverlay")
        }
      />

      <Dialog open={importWarningOpen} onOpenChange={handleImportWarningChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("collectionFormExtras.replaceTitle")}</DialogTitle>
            <DialogDescription>{t("collectionFormExtras.replaceDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleImportWarningChange(false)}
              disabled={parsingImport}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={() => void handleConfirmImport()} disabled={parsingImport}>
              {t("collectionFormExtras.importFile")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
