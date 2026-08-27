import type { CollectionAccessType } from "@/api/collection"

export interface CollectionDetailsValues {
  title: string
  description: string
  searchTags: string
  accessType: CollectionAccessType
  maxAttempts: string
}

export interface CollectionQuestionFormValues {
  id: string
  originalQuestionId?: number
  questionText: string
  options: string[]
  correctAnswer: number
}
