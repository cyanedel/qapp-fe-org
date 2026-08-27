import { env } from "@/config/env"

type RenewalResult = "renewed" | "rejected" | "unavailable"

const SESSION_EXPIRED_EVENT = "qapp-auth-session-expired"

let refreshPromise: Promise<RenewalResult> | null = null
let sessionAvailable = false
let lastActivityAt = Date.now()
let lastRefreshAt = 0

const notifySessionExpired = () => {
  sessionAvailable = false
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

const refreshSession = async (): Promise<RenewalResult> => {
  try {
    const response = await fetch(`${env.API_URL}/org/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    if (response.ok) {
      markSessionAvailable()
      return "renewed"
    }
    return response.status === 401 || response.status === 403 ? "rejected" : "unavailable"
  } catch {
    return "unavailable"
  }
}

const renewSession = () => {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export const markSessionAvailable = () => {
  sessionAvailable = true
  lastActivityAt = Date.now()
  lastRefreshAt = Date.now()
}

export const markSessionUnavailable = () => {
  sessionAvailable = false
}

export const authenticatedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const requestInit = { ...init, credentials: "include" as const }
  const response = await fetch(input, requestInit)
  if (response.status !== 401) return response

  const result = await renewSession()
  if (result === "renewed") return fetch(input, requestInit)
  if (result === "rejected") notifySessionExpired()
  return response
}

export const startSessionRenewal = () => {
  const recordActivity = () => {
    lastActivityAt = Date.now()
  }
  const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "scroll"]
  activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }))

  const intervalID = window.setInterval(async () => {
    const now = Date.now()
    if (!sessionAvailable || document.visibilityState !== "visible") return
    if (now - lastActivityAt > env.SESSION_ACTIVITY_WINDOW_MS) return
    if (now - lastRefreshAt < env.SESSION_REFRESH_INTERVAL_MS) return

    const result = await renewSession()
    if (result === "rejected") notifySessionExpired()
  }, env.SESSION_ACTIVITY_POLL_MS)

  return () => {
    window.clearInterval(intervalID)
    activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity))
  }
}
