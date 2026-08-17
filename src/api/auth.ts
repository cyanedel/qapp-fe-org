import { env } from "@/config/env"
import type { User } from "@/types"

export const AUTH_SESSION_EXPIRED_EVENT = "qapp-auth-session-expired"

export class AuthError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message)
    this.name = "AuthError"
  }
}

const notifySessionExpired = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${env.API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to login")
  }

  return data
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${env.API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthError(data.error)
    }
    throw new Error(data.error || "Failed to load user profile")
  }

  return data.user ?? data
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
  const response = await fetch(`${env.API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to logout")
  }

  return data
}
