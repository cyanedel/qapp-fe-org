import { getCurrentUser } from "@/api/auth"
import { authenticatedFetch } from "@/api/session"
import { env } from "@/config/env"
import type { Workspace, WorkspacePayload } from "@/types/workspace"
import { ApiError } from "@/api/response"

const parseResponse = async (response: Response, fallbackMessage: string) => {
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, fallbackMessage)
  }

  return data
}

export const listWorkspacesFromSession = async () => {
  const user = await getCurrentUser()
  return { user, workspaces: user.org ?? [] }
}

export const getWorkspace = async (workspaceId: string): Promise<Workspace> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    credentials: "include",
  })
  const data = await parseResponse(response, "Failed to load workspace")
  return data.organization ?? data
}

export const createWorkspace = async (payload: WorkspacePayload): Promise<Workspace> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/organization/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(response, "Failed to create workspace")
  return data.organization ?? data
}

export const updateWorkspace = async (workspaceId: string, payload: Partial<WorkspacePayload>): Promise<Workspace> => {
  const response = await authenticatedFetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(response, "Failed to update workspace")
  return data.organization ?? data
}

export const deleteWorkspace = async (workspaceId: string) => {
  const response = await authenticatedFetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to delete workspace")
}
