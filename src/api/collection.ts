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
  search_tags?: string[]
  access_type?: CollectionAccessType
  max_attempts?: number | null
}

export type CollectionAccessType = "public" | "premium" | "public_org" | "grant_org"

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
  search_tags?: string[]
  access_type?: CollectionAccessType
}

export const getOrgCollectionList = async (orgId: string): Promise<CollectionSummary[]> => {
  const response = await fetch(`${env.API_URL}/collection/${encodeURIComponent(orgId)}/list`, {
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
  const response = await fetch(`${env.API_URL}/org/collection/create`, {
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

export interface CollectionAccessPolicyPayload {
  access_type: CollectionAccessType
}

export interface CollectionMaintainer {
  collection_id: string
  user_id: string
  assigned_at?: string
  removed_at?: string | null
}

export interface CollectionAccessTag {
  tag_id: string
  org_id?: string
  name: string
  created_at?: string
  deleted_at?: string | null
}

export interface CollectionUserGrant {
  collection_id: string
  user_id: string
  expires_at?: string | null
  created_at?: string
  deleted_at?: string | null
}

const requestCollectionMutation = async (url: string, method: "PATCH" | "POST" | "DELETE", body?: unknown) => {
  const response = await fetch(`${env.API_URL}${url}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  })

  handleAuthResponse(response)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || "Collection operation failed")
  }
  return data
}

export const updateCollectionAccessPolicy = async (collectionId: string, accessType: CollectionAccessType) =>
  requestCollectionMutation(`/org/collection/${collectionId}/access-policy`, "PATCH", { access_type: accessType })

export const listCollectionMaintainers = async (collectionId: string): Promise<CollectionMaintainer[]> => {
  const response = await fetch(`${env.API_URL}/org/collection/${collectionId}/maintainer/list`, { credentials: "include" })
  handleAuthResponse(response)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Failed to load maintainers")
  return data.maintainers ?? data.data ?? []
}

export const assignCollectionMaintainer = async (collectionId: string, userId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/maintainer`, "POST", { user_id: userId })

export const removeCollectionMaintainer = async (collectionId: string, userId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/maintainer/${userId}`, "DELETE")

export const listOrganizationAccessTags = async (orgId: string): Promise<CollectionAccessTag[]> => {
  const response = await fetch(`${env.API_URL}/org/organization/${orgId}/access-tag/list`, { credentials: "include" })
  handleAuthResponse(response)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Failed to load access tags")
  return data.access_tags ?? data.data ?? []
}

export const listCollectionAccessTags = async (collectionId: string): Promise<CollectionAccessTag[]> => {
  const response = await fetch(`${env.API_URL}/org/collection/${collectionId}/access-tag/list`, { credentials: "include" })
  handleAuthResponse(response)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Failed to load collection access tags")
  return data.access_tags ?? data.data ?? []
}

export const assignCollectionAccessTag = async (collectionId: string, tagId: string, expiresAt?: string | null) =>
  requestCollectionMutation(`/org/collection/${collectionId}/access-tag`, "POST", { tag_id: tagId, expires_at: expiresAt ?? null })

export const removeCollectionAccessTag = async (collectionId: string, tagId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/access-tag/${tagId}`, "DELETE")

export const listCollectionUserGrants = async (collectionId: string): Promise<CollectionUserGrant[]> => {
  const response = await fetch(`${env.API_URL}/org/collection/${collectionId}/user-grant/list`, { credentials: "include" })
  handleAuthResponse(response)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Failed to load collection grants")
  return data.user_grants ?? data.grants ?? data.data ?? []
}

export const assignCollectionUserGrant = async (collectionId: string, userId: string, expiresAt?: string | null) =>
  requestCollectionMutation(`/org/collection/${collectionId}/user-grant`, "POST", { user_id: userId, expires_at: expiresAt ?? null })

export const removeCollectionUserGrant = async (collectionId: string, userId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/user-grant/${userId}`, "DELETE")
