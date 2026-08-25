import { handleAuthResponse } from "@/api/auth"
import { ApiError } from "@/api/response"
import { env } from "@/config/env"
import type { OrganizationMember, UserSearchResult } from "@/types/member"

const parseResponse = async (response: Response, fallbackMessage: string) => {
  handleAuthResponse(response)
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, fallbackMessage)
  }

  return data
}

const memberUrl = (workspaceId: string) => `${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}/member`

export const listOrganizationMembers = async (workspaceId: string): Promise<OrganizationMember[]> => {
  const response = await fetch(memberUrl(workspaceId), { credentials: "include" })
  const data = await parseResponse(response, "Failed to load workspace members")
  return data.members ?? []
}

export const searchOrganizationUsers = async (workspaceId: string, query: string): Promise<UserSearchResult[]> => {
  const url = new URL(`${memberUrl(workspaceId)}/search`)
  url.searchParams.set("query", query)
  const response = await fetch(url, { credentials: "include" })
  const data = await parseResponse(response, "Failed to search users")
  return data.users ?? []
}

export const addOrganizationMember = async (workspaceId: string, userId: string) => {
  const response = await fetch(memberUrl(workspaceId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: userId }),
  })
  return parseResponse(response, "Failed to add workspace member")
}

export const removeOrganizationMember = async (workspaceId: string, userId: string) => {
  const response = await fetch(`${memberUrl(workspaceId)}/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to remove workspace member")
}

export const updateOrganizationMemberStatus = async (workspaceId: string, userId: string, status: "active" | "suspended" | "removed") => {
  const response = await fetch(`${memberUrl(workspaceId)}/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  })
  return parseResponse(response, "Failed to update workspace member status")
}

export const addOrganizationRepresentative = async (workspaceId: string, userId: string) => {
  const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}/representative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: userId }),
  })
  return parseResponse(response, "Failed to grant representative access")
}

export const removeOrganizationRepresentative = async (workspaceId: string, userId: string) => {
  const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}/representative/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to revoke representative access")
}
