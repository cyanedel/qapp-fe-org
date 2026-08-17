import { handleAuthResponse } from "@/api/auth"
import { env } from "@/config/env"

export interface CreateQuestionItem {
  QuestionText: string
  Options: string[]
  CorrectAnswer: number
}

export interface CreateCollectionPayload {
  collection_id?: string
  title: string
  questions: CreateQuestionItem[]
  tags?: string[]
  max_attempts?: number | null
}

export interface CreateCollectionResponse {
  message?: string
  collection_id?: string
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
