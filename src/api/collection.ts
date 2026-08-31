import { authenticatedFetch } from "@/api/session"
import { env } from "@/config/env"
import { ApiError } from "@/api/response"

export interface CreateQuestionItem {
  id?: number
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
  status?: CollectionStatus
  max_attempts?: number | null
}

export type CollectionAccessType = "public" | "premium" | "public_org" | "grant_org"
export type CollectionStatus = "draft" | "published" | "archived"

export interface CreateCollectionResponse {
  code: string
  message: string
  collection_id?: string
  status?: CollectionStatus
}

export interface CollectionQuestion {
  id?: number
  questionText: string
  options: string[]
  correctAnswer?: number
}

export interface EditableCollectionQuestion extends CollectionQuestion {
  correctAnswer: number
}

export interface CollectionData {
  collection_id: string
  org_id?: string | null
  title: string
  description?: string | null
  search_tags?: string[]
  access_type: CollectionAccessType
  status: CollectionStatus
  published_at?: string | null
  archived_at?: string | null
  max_attempts?: number | null
  questions: CollectionQuestion[]
  can_edit: boolean
}

export interface CollectionEditData extends CollectionData {
  questions: EditableCollectionQuestion[]
}

export interface UpdateCollectionSummaryPayload {
  title: string
  description: string
  search_tags: string[]
  access_type: CollectionAccessType
  max_attempts: number
}

export interface UpdateCollectionQuestionsPayload {
  questions: EditableCollectionQuestion[]
}

export type UpdateCollectionPayload = UpdateCollectionSummaryPayload | UpdateCollectionQuestionsPayload

export interface CollectionSummary {
  collectionid: string
  org_id?: string | null
  user_id?: string
  user_id_last?: string
  title: string
  description?: string | null
  search_tags?: string[]
  access_type?: CollectionAccessType
  status: CollectionStatus
  published_at?: string | null
  archived_at?: string | null
  can_edit: boolean
}

export const getOrgCollectionList = async (orgId: string): Promise<CollectionSummary[]> => {
  const response = await authenticatedFetch(`${env.API_URL}/collection/${encodeURIComponent(orgId)}/list`, {
    method: "GET",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, "Failed to load collections")
  }

  return data.data ?? []
}

export const createCollection = async (payload: CreateCollectionPayload): Promise<CreateCollectionResponse> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, "Failed to create collection")
  }

  return data
}

export interface CollectionAccessPolicyPayload {
  access_type: CollectionAccessType
}

export interface CollectionEditor {
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
  const response = await authenticatedFetch(`${env.API_URL}${url}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new ApiError(data, "Collection operation failed")
  }
  return data
}

export const deleteCollection = async (collectionId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}`, "DELETE")

export const updateCollectionAccessPolicy = async (collectionId: string, accessType: CollectionAccessType) =>
  requestCollectionMutation(`/org/collection/${collectionId}/access-policy`, "PATCH", { access_type: accessType })

export const updateCollectionStatus = async (collectionId: string, status: CollectionStatus): Promise<CreateCollectionResponse> =>
  requestCollectionMutation(`/org/collection/${collectionId}/status`, "PATCH", { status })

export const listCollectionEditors = async (collectionId: string): Promise<CollectionEditor[]> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/${collectionId}/editor/list`)
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to load editors")
  return data.editors ?? data.data ?? []
}

export const assignCollectionEditor = async (collectionId: string, userId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/editor`, "POST", { user_id: userId })

export const removeCollectionEditor = async (collectionId: string, userId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/editor/${userId}`, "DELETE")

export interface CollectionEditPermissionResponse {
  code: string
  message: string
  can_edit: boolean
}

export const getCollectionEditPermission = async (collectionId: string): Promise<CollectionEditPermissionResponse> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/${collectionId}/permissions`)
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to check collection edit permission")
  return data
}

export const getCollection = async (collectionId: string): Promise<CollectionData> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/${collectionId}`)
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to load collection")
  return data.collection
}

const patchCollection = async (collectionId: string, payload: UpdateCollectionPayload): Promise<CreateCollectionResponse> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/${collectionId}/edit`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to update collection")
  return data
}

export const updateCollectionSummary = async (collectionId: string, payload: UpdateCollectionSummaryPayload) =>
  patchCollection(collectionId, payload)

export const updateCollectionQuestions = async (collectionId: string, payload: UpdateCollectionQuestionsPayload) =>
  patchCollection(collectionId, payload)

export const listOrganizationAccessTags = async (orgId: string): Promise<CollectionAccessTag[]> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/organization/${orgId}/access-tag/list`)
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to load access tags")
  return data.access_tags ?? data.data ?? []
}

export const listCollectionAccessTags = async (collectionId: string): Promise<CollectionAccessTag[]> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/${collectionId}/access-tag/list`)
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to load collection access tags")
  return data.access_tags ?? data.data ?? []
}

export const assignCollectionAccessTag = async (collectionId: string, tagId: string, expiresAt?: string | null) =>
  requestCollectionMutation(`/org/collection/${collectionId}/access-tag`, "POST", { tag_id: tagId, expires_at: expiresAt ?? null })

export const removeCollectionAccessTag = async (collectionId: string, tagId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/access-tag/${tagId}`, "DELETE")

export const listCollectionUserGrants = async (collectionId: string): Promise<CollectionUserGrant[]> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/collection/${collectionId}/user-grant/list`)
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to load collection grants")
  return data.user_grants ?? data.grants ?? data.data ?? []
}

export const assignCollectionUserGrant = async (collectionId: string, userId: string, expiresAt?: string | null) =>
  requestCollectionMutation(`/org/collection/${collectionId}/user-grant`, "POST", { user_id: userId, expires_at: expiresAt ?? null })

export const removeCollectionUserGrant = async (collectionId: string, userId: string) =>
  requestCollectionMutation(`/org/collection/${collectionId}/user-grant/${userId}`, "DELETE")
