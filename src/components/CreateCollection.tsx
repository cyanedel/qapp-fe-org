import type React from "react"
import { useMemo, useState } from "react"
import { ReactSortable } from "react-sortablejs"
import { AlertCircle, CheckCircle2, ChevronDown, GripVertical, Plus, Save, Trash2 } from "lucide-react"
import { createCollection } from "@/api/collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

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
  correctAnswer: 0,
})

export const CreateCollection = () => {
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [maxAttempts, setMaxAttempts] = useState("")
  const [questions, setQuestions] = useState<QuestionForm[]>([createBlankQuestion()])
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
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

  const validateForm = () => {
    if (!title.trim()) return "Collection title is required."
    if (questions.length === 0) return "Add at least one question."

    const invalidQuestionIndex = questions.findIndex((question) => {
      return !question.questionText.trim() || question.options.some((option) => !option.trim())
    })

    if (invalidQuestionIndex >= 0) {
      return `Question ${invalidQuestionIndex + 1} needs text and all option fields.`
    }

    const maxAttemptsNumber = Number(maxAttempts)
    if (maxAttempts && (!Number.isInteger(maxAttemptsNumber) || maxAttemptsNumber < 1)) {
      return "Max attempts must be a whole number greater than 0."
    }

    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const response = await createCollection({
        title: title.trim(),
        tags: parsedTags,
        max_attempts: maxAttempts ? Number(maxAttempts) : null,
        questions: questions.map((question) => ({
          QuestionText: question.questionText.trim(),
          Options: question.options.map((option) => option.trim()),
          CorrectAnswer: question.correctAnswer,
        })),
      })

      setSuccessMessage(`Collection created${response.collection_id ? `: ${response.collection_id}` : "."}`)
      setTitle("")
      setTags("")
      setMaxAttempts("")
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
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

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="collection-title">Title</Label>
              <Input
                id="collection-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Basic math placement quiz"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-tags">Tags</Label>
              <Input
                id="collection-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="math, grade 7, placement"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-max-attempts">Max attempts</Label>
              <Input
                id="collection-max-attempts"
                type="number"
                min="1"
                step="1"
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(event.target.value)}
                placeholder="Unlimited"
                disabled={loading}
              />
            </div>
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
          className="space-y-4"
        >
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="question-sortable-item">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="question-drag-handle flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
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
                      className="flex min-w-0 items-center gap-2 text-left"
                      aria-expanded={!collapsedQuestionIds.includes(question.id)}
                      aria-controls={`question-panel-${question.id}`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          collapsedQuestionIds.includes(question.id) ? "-rotate-90" : ""
                        }`}
                      />
                      <CardTitle className="truncate">
                        Question {questionIndex + 1}
                        {question.questionText.trim() ? `: ${question.questionText.trim()}` : ""}
                      </CardTitle>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
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
                  className={`space-y-4 ${collapsedQuestionIds.includes(question.id) ? "hidden" : ""}`}
                >
                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>Question text</Label>
                    <textarea
                      id={`question-${question.id}`}
                      value={question.questionText}
                      onChange={(event) => updateQuestion(questionIndex, event.target.value)}
                      placeholder="Write the question"
                      disabled={loading}
                      className="min-h-24 w-full rounded-md border border-transparent bg-input/50 px-3 py-2 text-sm outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="space-y-2 rounded-lg border bg-background p-3">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                          <input
                            type="radio"
                            name={`correct-answer-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateCorrectAnswer(questionIndex, optionIndex)}
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
  )
}
