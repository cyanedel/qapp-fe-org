export type UserRole = "end_user" | "question_maker" | "admin"

export interface UserOrganization {
  org_id: string
  display_name?: string | null
  description?: string | null
}

export interface UserRoleAssignment {
  role_id: number
  role: string
}

export interface User {
  user_id: string
  username: string
  email: string
  display_name?: string | null
  phone_country_code?: string | null
  phone_number?: string | null
  registered_address?: string | null
  domicile_address?: string | null
  domicile_same_as_registered?: boolean
  date_of_birth?: string | null
  gender?: string | null
  profession?: string | null
  locale?: string | null
  timezone?: string | null
  avatar_url?: string | null
  role?: UserRole
  org?: UserOrganization[]
  org_id?: string[]
  roles?: UserRoleAssignment[]
  created_at: string
  updated_at: string
}
