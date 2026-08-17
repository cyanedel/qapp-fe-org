export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  TIMEOUT_UI: import.meta.env.VITE_TIMEOUT_UI ?? 5000,
  TIMEOUT: Number(import.meta.env.VITE_TIMEOUT ?? 5000),
} as const
