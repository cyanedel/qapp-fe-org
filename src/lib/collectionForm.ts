import type {
  CollectionData,
  CreateQuestionItem,
  EditableCollectionQuestion,
  UpdateCollectionSummaryPayload,
} from "@/api/collection"
import type { CollectionDetailsValues, CollectionQuestionFormValues } from "@/types/collection"

export const emptyCollectionDetails = (): CollectionDetailsValues => ({
  title: "",
  description: "",
  searchTags: "",
  accessType: "public",
  maxAttempts: "0",
})

export const collectionDetailsFromData = (collection: CollectionData): CollectionDetailsValues => ({
  title: collection.title,
  description: collection.description ?? "",
  searchTags: collection.search_tags?.join(", ") ?? "",
  accessType: collection.access_type,
  maxAttempts: String(collection.max_attempts ?? 0),
})

export const parseCollectionSearchTags = (searchTags: string): string[] =>
  searchTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

export const collectionSummaryPayload = (
  details: CollectionDetailsValues
): UpdateCollectionSummaryPayload => ({
  title: details.title.trim(),
  // The current backend treats null as "leave unchanged" during edit. An empty
  // string explicitly clears the description while keeping the PATCH partial.
  description: details.description.trim(),
  search_tags: parseCollectionSearchTags(details.searchTags),
  access_type: details.accessType,
  max_attempts: Number(details.maxAttempts),
})

export const collectionSummaryFingerprint = (details: CollectionDetailsValues): string =>
  JSON.stringify(collectionSummaryPayload(details))

export const createBlankQuestion = (): CollectionQuestionFormValues => ({
  id: crypto.randomUUID(),
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 1,
})

export const questionFormsFromData = (
  questions: EditableCollectionQuestion[]
): CollectionQuestionFormValues[] =>
  questions.length > 0
    ? questions.map((question) => ({
        id: crypto.randomUUID(),
        originalQuestionId: question.id,
        questionText: question.questionText,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
      }))
    : [createBlankQuestion()]

export const questionPayloadFromForms = (
  questions: CollectionQuestionFormValues[]
): CreateQuestionItem[] =>
  questions.map((question) => ({
    id: question.originalQuestionId,
    questionText: question.questionText.trim(),
    options: question.options.map((option) => option.trim()),
    correctAnswer: question.correctAnswer,
  }))
