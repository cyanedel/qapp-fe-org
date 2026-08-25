import type { UserRoleAssignment } from "@/types/auth"

export type MembershipStatus = "active" | "suspended" | "removed"

export interface OrganizationMember {
  membership_id: string
  org_id: string
  user_id: string
  username: string
  email: string
  display_name?: string | null
  avatar_url?: string | null
  roles: UserRoleAssignment[]
  status: MembershipStatus
  is_representative: boolean
  joined_at: string
  left_at?: string | null
}

export interface UserSearchResult {
  user_id: string
  username: string
  email: string
  display_name?: string | null
  avatar_url?: string | null
  membership_status?: MembershipStatus | null
}
