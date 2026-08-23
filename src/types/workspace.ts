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
