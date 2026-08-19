import { handleAuthResponse } from "@/api/auth"
import { env } from "@/config/env"

export interface CreateQuestionItem {
  questionText: string
  options: string[]
  correctAnswer: number
}

export interface CreateCollectionPayload {
  collection_id?: string
  org_id?: string
  title: string
  description?: string | null
  questions: CreateQuestionItem[]
  tags?: string[]
  max_attempts?: number | null
}

export interface CreateCollectionResponse {
  message?: string
  collection_id?: string
}

export interface CollectionSummary {
  collectionid: string
  org_id?: string | null
  user_id?: string
  user_id_last?: string
  title: string
  description?: string | null
  tags?: string[]
}

export const getCollectionList = async (): Promise<CollectionSummary[]> => {
  const response = await fetch(`${env.API_URL}/collection/list`, {
    method: "GET",
    credentials: "include",
  })

  handleAuthResponse(response)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to load collections")
  }

  return data.data ?? []
}

export const createCollection = async (payload: CreateCollectionPayload): Promise<CreateCollectionResponse> => {
  const response = await fetch(`${env.API_URL}/collection/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  handleAuthResponse(response)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to create collection")
  }

  return data
}
