export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  TIMEOUT_UI: import.meta.env.VITE_TIMEOUT_UI ?? 5000,
  TIMEOUT: Number(import.meta.env.VITE_TIMEOUT ?? 5000),
  SESSION_REFRESH_INTERVAL_MS: Number(import.meta.env.VITE_SESSION_REFRESH_INTERVAL_MS ?? 600000),
  SESSION_ACTIVITY_WINDOW_MS: Number(import.meta.env.VITE_SESSION_ACTIVITY_WINDOW_MS ?? 1800000),
  SESSION_ACTIVITY_POLL_MS: Number(import.meta.env.VITE_SESSION_ACTIVITY_POLL_MS ?? 30000),
} as const
