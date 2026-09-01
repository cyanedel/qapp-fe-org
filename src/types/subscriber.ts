import type { UserRoleAssignment } from "@/types/auth"

export type SubscriberStatus = "active" | "suspended" | "removed"

export interface OrganizationSubscriber {
  subscription_id: string
  org_id: string
  user_id: string
  username: string
  email: string
  display_name?: string | null
  avatar_url?: string | null
  roles: UserRoleAssignment[]
  status: SubscriberStatus
  subscribed_at: string
  ended_at?: string | null
}

export interface SubscriberSearchResult {
  user_id: string
  username: string
  email: string
  display_name?: string | null
  avatar_url?: string | null
  subscription_status?: SubscriberStatus | null
}

export interface SubscriberGroup {
  group_id: string
  org_id: string
  name: string
  description?: string | null
  subscriber_count: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface SubscriberGroupInput {
  name: string
  description?: string | null
}

export interface SubscriberGroupMember {
  group_id: string
  user_id: string
  username: string
  email: string
  display_name?: string | null
  avatar_url?: string | null
  subscription_status: SubscriberStatus
  assigned_at: string
  assigned_by?: string | null
  removed_at?: string | null
}
