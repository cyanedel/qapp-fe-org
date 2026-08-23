import { getCurrentUser, handleAuthResponse } from "@/api/auth"
import { env } from "@/config/env"
import type { Workspace, WorkspacePayload } from "@/types/workspace"

const parseResponse = async (response: Response, fallbackMessage: string) => {
  handleAuthResponse(response)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage)
  }

  return data
}

const workspaceCache = new Map<string, Promise<Workspace>>()

export const listWorkspacesFromSession = async () => {
  const user = await getCurrentUser()
  return { user, workspaces: user.org ?? [] }
}

export const getWorkspace = async (workspaceId: string): Promise<Workspace> => {
  const cachedWorkspace = workspaceCache.get(workspaceId)
  if (cachedWorkspace) return cachedWorkspace

  const request = (async () => {
    const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
      credentials: "include",
    })
    const data = await parseResponse(response, "Failed to load workspace")
    return (data.organization ?? data) as Workspace
  })()

  workspaceCache.set(workspaceId, request)
  request.catch(() => workspaceCache.delete(workspaceId))
  return request
}

export const createWorkspace = async (payload: WorkspacePayload): Promise<Workspace> => {
  const response = await fetch(`${env.API_URL}/org/organization/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(response, "Failed to create workspace")
  return data.organization ?? data
}

export const updateWorkspace = async (workspaceId: string, payload: Partial<WorkspacePayload>): Promise<Workspace> => {
  const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(response, "Failed to update workspace")
  const workspace = (data.organization ?? data) as Workspace
  workspaceCache.set(workspaceId, Promise.resolve(workspace))
  return workspace
}

export const deleteWorkspace = async (workspaceId: string) => {
  workspaceCache.delete(workspaceId)
  const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to delete workspace")
}
