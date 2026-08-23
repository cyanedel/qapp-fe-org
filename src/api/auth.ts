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
