import { env } from "@/config/env"
import { collectAccessLogInfo } from "@/lib/accessLogInfo"
import type { User } from "@/types/auth"
import { ApiError } from "@/api/response"

export const AUTH_SESSION_EXPIRED_EVENT = "qapp-auth-session-expired"

export class AuthError extends Error {
  readonly code: string

  constructor(message = "Your session has expired. Please sign in again.", code = "AUTH_INVALID_SESSION") {
    super(message)
    this.name = "AuthError"
    this.code = code
  }
}

const notifySessionExpired = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${env.API_URL}/org/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password, info: collectAccessLogInfo() }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, "Failed to login")
  }

  return data
}

export const registerUser = async (email: string, password: string) => {
  const response = await fetch(`${env.API_URL}/org/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, "Failed to register account")
  }

  return data
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${env.API_URL}/org/auth/me`, {
    method: "GET",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      const error = new ApiError(data, "Failed to load user profile")
      throw new AuthError(error.message, error.code)
    }
    throw new ApiError(data, "Failed to load user profile")
  }

  return data.user ?? data
}

const updateOrgAuthUser = async <T>(path: string, payload: T) => {
  const response = await fetch(`${env.API_URL}/org/auth/me/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Failed to update profile")
  return data.user ?? data
}

export interface ProfileUpdateInput {
  display_name?: string
  phone_country_code?: string
  phone_number?: string
  date_of_birth?: string
  gender?: string
  profession?: string
  locale?: string
  timezone?: string
  registered_address?: string
  domicile_address?: string
  domicile_same_as_registered?: boolean
}

export const updateProfile = (payload: ProfileUpdateInput) => updateOrgAuthUser("profile", payload)
export const updateEmail = (email: string) => updateOrgAuthUser("email", { email })
export const updateUsername = (username: string) => updateOrgAuthUser("username", { username })
export const updatePassword = (current_password: string, new_password: string) => updateOrgAuthUser("password", { current_password, new_password })

export const checkUsernameAvailability = async (username: string): Promise<{ username: string; available: boolean }> => {
  const response = await fetch(`${env.API_URL}/org/auth/username-availability?username=${encodeURIComponent(username)}`, {
    credentials: "include",
  })
  const data = await response.json()
  if (!response.ok) throw new ApiError(data, "Unable to check username")
  return data
}

export const validateCurrentSession = async (): Promise<User | null> => {
  try {
    return await getCurrentUser()
  } catch (err) {
    if (err instanceof AuthError) {
      return null
    }
    throw err
  }
}

export const handleAuthResponse = (response: Response) => {
  if (response.status === 401) {
    notifySessionExpired()
  }
}

export const logoutUser = async () => {
  const response = await fetch(`${env.API_URL}/org/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ info: collectAccessLogInfo() }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data, "Failed to logout")
  }

  return data
}
