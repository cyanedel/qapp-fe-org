import type { CollectionAccessType, CollectionStatus } from "@/api/collection"

export interface CollectionDetailsValues {
  title: string
  description: string
  searchTags: string
  accessType: CollectionAccessType
  status: CollectionStatus
  maxAttempts: string
  subscriberIds: string[]
  subscriberGroupIds: string[]
}

export interface CollectionQuestionFormValues {
  id: string
  originalQuestionId?: number
  questionText: string
  options: string[]
  correctAnswer: number
}
