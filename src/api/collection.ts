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

export interface CreateCollectionFilePayload {
  collection_id?: string
  org_id?: string
  title: string
  description?: string | null
  tags?: string[]
  max_attempts?: number | null
  questionsFile: File
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

export const createCollectionFromFile = async (
  payload: CreateCollectionFilePayload
): Promise<CreateCollectionResponse> => {
  const formData = new FormData()

  if (payload.collection_id) formData.append("collection_id", payload.collection_id)
  if (payload.org_id) formData.append("org_id", payload.org_id)
  formData.append("title", payload.title)
  if (payload.description) formData.append("description", payload.description)
  if (payload.tags?.length) formData.append("tags", payload.tags.join(","))
  if (payload.max_attempts !== null && payload.max_attempts !== undefined) {
    formData.append("max_attempts", String(payload.max_attempts))
  }
  formData.append("questions_file", payload.questionsFile)

  const response = await fetch(`${env.API_URL}/collection/create`, {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  handleAuthResponse(response)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to import collection")
  }

  return data
}
