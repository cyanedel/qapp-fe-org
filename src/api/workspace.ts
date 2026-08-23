import { getCurrentUser, handleAuthResponse } from "@/api/auth"
import { env } from "@/config/env"

export interface Workspace {
  org_id: string
  display_name?: string | null
  org_logo?: string | null
  description?: string | null
  representatives: string[]
  created_at?: string
  updated_at?: string
}

export interface WorkspacePayload {
  display_name: string
  org_logo?: string | null
  description?: string | null
}

const parseResponse = async (response: Response, fallbackMessage: string) => {
  handleAuthResponse(response)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage)
  }

  return data
}

export const listWorkspacesFromSession = async () => {
  const user = await getCurrentUser()
  return { user, workspaces: user.org ?? [] }
}

export const getWorkspace = async (workspaceId: string): Promise<Workspace> => {
  const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    credentials: "include",
  })
  const data = await parseResponse(response, "Failed to load workspace")
  return data.organization ?? data
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
  return data.organization ?? data
}

export const deleteWorkspace = async (workspaceId: string) => {
  const response = await fetch(`${env.API_URL}/org/organization/${encodeURIComponent(workspaceId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  return parseResponse(response, "Failed to delete workspace")
}
