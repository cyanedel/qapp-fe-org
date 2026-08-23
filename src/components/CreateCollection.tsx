import type React from "react"
import type { SubmitEvent } from "react"
import { useMemo, useRef, useState } from "react"
import { ReactSortable } from "react-sortablejs"
import { AlertCircle, ChevronDown, FileUp, GripVertical, Plus, Save, Trash2 } from "lucide-react"
import { createCollection, type CollectionAccessType, type CollectionEditData } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollectionCreatedDialog } from "@/components/CollectionCreatedDialog"
import { CollectionDetailsCard, type CollectionDetailsValues } from "@/components/CollectionDetailsCard"
import { OperationOverlay } from "@/components/OperationOverlay"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { isSupportedCollectionImport, parseCollectionImport, type ImportedQuestion } from "@/lib/collectionImport"
import { useAuthStore } from "@/store/useAuthStore"

interface QuestionForm {
  id: string
  originalQuestionID?: number
  questionText: string
  options: string[]
  correctAnswer: number
}

interface CollectionFormPayload {
  title: string
  description: string | null
  questions: Array<{
    id?: number
    questionText: string
    options: string[]
    correctAnswer: number
  }>
  search_tags: string[]
  access_type: CollectionAccessType
  max_attempts: number
}

interface CollectionFormProps {
  mode: "create" | "edit"
  initialCollection?: CollectionEditData
  onSubmit: (payload: CollectionFormPayload & { org_id?: string }) => Promise<{ collection_id?: string }>
  onSuccess?: (collectionId?: string) => void
}

const createBlankQuestion = (): QuestionForm => ({
  id: crypto.randomUUID(),
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 1,
})

export const CollectionForm = ({ mode, initialCollection, onSubmit, onSuccess }: CollectionFormProps) => {
  const user = useAuthStore((state) => state.user)
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [details, setDetails] = useState<CollectionDetailsValues>({
    title: initialCollection?.title ?? "",
    description: initialCollection?.description ?? "",
    searchTags: initialCollection?.search_tags?.join(", ") ?? "",
    accessType: initialCollection?.access_type ?? "public",
    maxAttempts: String(initialCollection?.max_attempts ?? 0),
  })
  const [questions, setQuestions] = useState<QuestionForm[]>(
    initialCollection?.questions.length
      ? initialCollection.questions.map((question) => ({
          id: crypto.randomUUID(),
          originalQuestionID: question.id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
        }))
      : [createBlankQuestion()]
  )
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [parsingImport, setParsingImport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImportFileName, setSelectedImportFileName] = useState<string | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [importWarningOpen, setImportWarningOpen] = useState(false)
  const [createdCollectionId, setCreatedCollectionId] = useState<string | undefined>()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const parsedTags = useMemo(
    () =>
      details.searchTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [details.searchTags]
  )
  const workspaceId = activeWorkspaceId || user?.org?.[0]?.org_id || user?.org_id?.[0] || ""

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

  const addQuestion = () => {
    setQuestions((currentQuestions) => [...currentQuestions, createBlankQuestion()])
  }

  const removeQuestion = (questionIndex: number) => {
    setQuestions((currentQuestions) => {
      const removedQuestion = currentQuestions[questionIndex]
      if (removedQuestion) {
        setCollapsedQuestionIds((currentIds) => currentIds.filter((id) => id !== removedQuestion.id))
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
      const nextQuestions: QuestionForm[] = importedQuestions.map((question: ImportedQuestion) => ({
        ...question,
        id: crypto.randomUUID(),
      }))

      setQuestions(nextQuestions)
      setCollapsedQuestionIds([])
      setSelectedImportFileName(file.name)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to parse the selected file."
      setError(errorMessage)
    } finally {
      setParsingImport(false)
    }
  }

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) return

    setError(null)

    if (!isSupportedCollectionImport(file.name)) {
      setError("Choose a JSON, CSV, or Excel (.xlsx) file.")
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

  const validateForm = () => {
    if (!details.title.trim()) return "Collection title is required."
    if (mode === "create" && !workspaceId) return "A workspace is required to create a collection."
    if (questions.length === 0) return "Add at least one question."

    const invalidQuestionIndex = questions.findIndex((question) => {
      return !question.questionText.trim() || question.options.some((option) => !option.trim())
    })

    if (invalidQuestionIndex >= 0) {
      return `Question ${invalidQuestionIndex + 1} needs text and all option fields.`
    }

    const maxAttemptsNumber = Number(details.maxAttempts)
    if (!Number.isInteger(maxAttemptsNumber) || maxAttemptsNumber < 0) {
      return "Max attempts must be a whole number of 0 or greater."
    }

    return null
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessDialogOpen(false)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const response = await onSubmit({
        ...(mode === "create" ? { org_id: workspaceId } : {}),
        title: details.title.trim(),
        description: details.description.trim() || null,
        search_tags: parsedTags,
        access_type: details.accessType,
        max_attempts: Number(details.maxAttempts),
        questions: questions.map((question) => ({
          id: question.originalQuestionID,
          questionText: question.questionText.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: question.correctAnswer,
        })),
      })

      if (mode === "create") {
        setCreatedCollectionId(response.collection_id)
        setSuccessDialogOpen(true)
        setDetails({ title: "", description: "", searchTags: "", accessType: "public", maxAttempts: "0" })
        setQuestions([createBlankQuestion()])
        setCollapsedQuestionIds([])
        setSelectedImportFileName(null)
        if (importFileInputRef.current) importFileInputRef.current.value = ""
      }
      onSuccess?.(response.collection_id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} collection.`
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 overflow-x-hidden px-6 py-8">
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-medium text-primary">Collections</p>
        <h1 className="text-3xl font-bold tracking-tight">{mode === "create" ? "Create question collection" : "Edit question collection"}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {mode === "create" ? "Build" : "Update"} a collection with a title, tags, attempt limit, and multiple-choice questions.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="min-w-0 space-y-6 overflow-x-hidden">
        <CollectionDetailsCard values={details} onChange={setDetails} disabled={loading} />

        <Card>
          <CardHeader>
            <CardTitle>Import questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="collection-import-file">Question file</Label>
              <input
                ref={importFileInputRef}
                id="collection-import-file"
                type="file"
                accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleImportFileChange}
                disabled={loading || parsingImport}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Choose a JSON, CSV, or Excel (.xlsx) file. Imported questions will replace the current question list after confirmation.
              </p>
            </div>

            {parsingImport && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <Spinner className="size-4" />
                Reading question file...
              </div>
            )}

            {selectedImportFileName && !parsingImport && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <FileUp className="h-4 w-4 text-primary" />
                <span className="truncate">Loaded {selectedImportFileName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <ReactSortable<QuestionForm>
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
            <div key={question.id} className="question-sortable-item min-w-0 max-w-full overflow-hidden">
              <Card className="min-w-0 max-w-full overflow-hidden">
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <span
                      className="question-drag-handle flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
                      role="button"
                      aria-label={`Drag question ${questionIndex + 1}`}
                      title={`Drag question ${questionIndex + 1}`}
                      tabIndex={0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleQuestionCollapsed(question.id)}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                      aria-expanded={!collapsedQuestionIds.includes(question.id)}
                      aria-controls={`question-panel-${question.id}`}
                    >
                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 transition-transform ${
                          collapsedQuestionIds.includes(question.id) ? "-rotate-90" : ""
                        }`}
                      />
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <CardTitle className="text-base leading-snug">
                          Question {questionIndex + 1}
                        </CardTitle>
                        {question.questionText.trim() && (
                          <span className="mt-1 block max-w-full whitespace-normal text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                            {question.questionText.trim()}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={loading || questions.length === 1}
                      aria-label={`Remove question ${questionIndex + 1}`}
                      title={`Remove question ${questionIndex + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent
                  id={`question-panel-${question.id}`}
                  className={`min-w-0 space-y-4 overflow-hidden ${collapsedQuestionIds.includes(question.id) ? "hidden" : ""}`}
                >
                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>Question text</Label>
                    <textarea
                      id={`question-${question.id}`}
                      value={question.questionText}
                      onChange={(event) => updateQuestion(questionIndex, event.target.value)}
                      placeholder="Write the question"
                      disabled={loading}
                      wrap="soft"
                      className="min-h-24 w-full min-w-0 resize-y overflow-x-hidden rounded-md border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-pre-wrap break-words outline-none transition-[color,box-shadow,background-color] [overflow-wrap:anywhere] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="grid min-w-0 gap-3 md:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="min-w-0 space-y-2 overflow-hidden rounded-lg border bg-background p-3">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                          <input
                            type="radio"
                            name={`correct-answer-${question.id}`}
                            checked={question.correctAnswer === optionIndex + 1}
                            onChange={() => updateCorrectAnswer(questionIndex, optionIndex + 1)}
                            className="h-4 w-4 accent-primary"
                            disabled={loading}
                          />
                          Correct option {optionIndex + 1}
                        </span>
                        <Input
                          value={option}
                          onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          disabled={loading}
                          required
                        />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </ReactSortable>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={addQuestion} disabled={loading}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2 size-4" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "create" ? "Create Collection" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
      </div>
      <OperationOverlay open={loading} message={mode === "create" ? "Creating collection..." : "Saving collection..."} />
      <Dialog open={importWarningOpen} onOpenChange={handleImportWarningChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace current questions?</DialogTitle>
            <DialogDescription>
              Importing this file will replace the questions currently entered on this page. Your collection details will not be changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleImportWarningChange(false)} disabled={parsingImport}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleConfirmImport()} disabled={parsingImport}>
              Import file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {mode === "create" && <CollectionCreatedDialog open={successDialogOpen} collectionId={createdCollectionId} onOpenChange={setSuccessDialogOpen} />}
    </>
  )
}

export const CreateCollection = () => <CollectionForm mode="create" onSubmit={createCollection} />
