import { ApiError } from "@/api/response"
import { authenticatedFetch } from "@/api/session"
import { env } from "@/config/env"
import type {
  OrganizationSubscriber,
  SubscriberGroup,
  SubscriberGroupInput,
  SubscriberGroupMember,
  SubscriberSearchResult,
  SubscriberStatus,
} from "@/types/subscriber"

const parseResponse = async (response: Response, fallbackMessage: string) => {
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, fallbackMessage)
  }

  return data
}

const subscriberUrl = (workspaceId: string) =>
  `${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}/subscriber`

const groupUrl = (groupId: string) =>
  `${env.API_URL}/org/subscriber-group/${encodeURIComponent(groupId)}`

export const listOrganizationSubscribers = async (workspaceId: string): Promise<OrganizationSubscriber[]> => {
  const response = await authenticatedFetch(subscriberUrl(workspaceId))
  const data = await parseResponse(response, "Failed to load organization subscribers")
  return data.subscribers ?? []
}

export const searchOrganizationSubscribers = async (workspaceId: string, query: string): Promise<SubscriberSearchResult[]> => {
  const url = new URL(`${subscriberUrl(workspaceId)}/search`)
  url.searchParams.set("query", query)
  const response = await authenticatedFetch(url)
  const data = await parseResponse(response, "Failed to search eligible subscribers")
  return data.users ?? []
}

export const addOrganizationSubscriber = async (workspaceId: string, userId: string) => {
  const response = await authenticatedFetch(subscriberUrl(workspaceId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: userId }),
  })
  return parseResponse(response, "Failed to add organization subscriber")
}

export const updateOrganizationSubscriberStatus = async (
  workspaceId: string,
  userId: string,
  status: SubscriberStatus,
) => {
  const response = await authenticatedFetch(`${subscriberUrl(workspaceId)}/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  })
  return parseResponse(response, "Failed to update organization subscriber status")
}

export const removeOrganizationSubscriber = async (workspaceId: string, userId: string) => {
  const response = await authenticatedFetch(`${subscriberUrl(workspaceId)}/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to remove organization subscriber")
}

export const listSubscriberGroups = async (workspaceId: string): Promise<SubscriberGroup[]> => {
  const response = await authenticatedFetch(
    `${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}/subscriber-group`,
  )
  const data = await parseResponse(response, "Failed to load subscriber groups")
  return data.groups ?? []
}

export const createSubscriberGroup = async (workspaceId: string, input: SubscriberGroupInput): Promise<SubscriberGroup> => {
  const response = await authenticatedFetch(
    `${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}/subscriber-group`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    },
  )
  const data = await parseResponse(response, "Failed to create subscriber group")
  return data.group
}

export const updateSubscriberGroup = async (groupId: string, input: SubscriberGroupInput): Promise<SubscriberGroup> => {
  const response = await authenticatedFetch(groupUrl(groupId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  })
  const data = await parseResponse(response, "Failed to update subscriber group")
  return data.group
}

export const removeSubscriberGroup = async (groupId: string) => {
  const response = await authenticatedFetch(groupUrl(groupId), {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to remove subscriber group")
}

export const listSubscriberGroupMembers = async (groupId: string): Promise<SubscriberGroupMember[]> => {
  const response = await authenticatedFetch(`${groupUrl(groupId)}/subscriber`)
  const data = await parseResponse(response, "Failed to load subscriber group members")
  return data.subscribers ?? []
}

export const assignSubscriberGroupMember = async (groupId: string, userId: string) => {
  const response = await authenticatedFetch(`${groupUrl(groupId)}/subscriber`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: userId }),
  })
  return parseResponse(response, "Failed to assign subscriber to group")
}

export const removeSubscriberGroupMember = async (groupId: string, userId: string) => {
  const response = await authenticatedFetch(`${groupUrl(groupId)}/subscriber/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to remove subscriber from group")
}
