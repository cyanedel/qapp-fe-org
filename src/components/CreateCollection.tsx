import type React from "react"
import { useMemo, useState } from "react"
import { ReactSortable } from "react-sortablejs"
import { AlertCircle, ChevronDown, GripVertical, Plus, Save, Trash2 } from "lucide-react"
import { createCollection } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollectionCreatedDialog } from "@/components/CollectionCreatedDialog"
import { CollectionDetailsCard, type CollectionDetailsValues } from "@/components/CollectionDetailsCard"
import { OperationOverlay } from "@/components/OperationOverlay"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"

interface QuestionForm {
  id: string
  questionText: string
  options: string[]
  correctAnswer: number
}

const createBlankQuestion = (): QuestionForm => ({
  id: crypto.randomUUID(),
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 1,
})

export const CreateCollection = () => {
  const user = useAuthStore((state) => state.user)
  const [details, setDetails] = useState<CollectionDetailsValues>({
    title: "",
    description: "",
    tags: "",
    maxAttempts: "0",
  })
  const [questions, setQuestions] = useState<QuestionForm[]>([createBlankQuestion()])
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdCollectionId, setCreatedCollectionId] = useState<string | undefined>()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const parsedTags = useMemo(
    () =>
      details.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [details.tags]
  )
  const workspaceId = user?.org?.[0]?.org_id || user?.org_id?.[0] || ""

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

  const validateForm = () => {
    if (!details.title.trim()) return "Collection title is required."
    if (!workspaceId) return "A workspace is required to create a collection."
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      const response = await createCollection({
        org_id: workspaceId,
        title: details.title.trim(),
        description: details.description.trim() || null,
        tags: parsedTags,
        max_attempts: Number(details.maxAttempts),
        questions: questions.map((question) => ({
          questionText: question.questionText.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: question.correctAnswer,
        })),
      })

      setCreatedCollectionId(response.collection_id)
      setSuccessDialogOpen(true)
      setDetails({ title: "", description: "", tags: "", maxAttempts: "0" })
      setQuestions([createBlankQuestion()])
      setCollapsedQuestionIds([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create collection."
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
        <h1 className="text-3xl font-bold tracking-tight">Create question collection</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Build a collection by adding a title, tags, attempt limit, and multiple-choice questions.
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
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Collection
              </>
            )}
          </Button>
        </div>
      </form>
      </div>
      <OperationOverlay open={loading} message="Creating collection..." />
      <CollectionCreatedDialog
        open={successDialogOpen}
        collectionId={createdCollectionId}
        onOpenChange={setSuccessDialogOpen}
      />
    </>
  )
}
