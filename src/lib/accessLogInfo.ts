export type AccessLogInfo = {
  timezone?: string
  language?: string
  languages?: string[]
  platform?: string
  userAgent?: string
  cookiesEnabled?: boolean
  screen?: {
    width?: number
    height?: number
    pixelRatio?: number
    colorDepth?: number
  }
  device?: {
    type?: string
    memoryGb?: number
    cpuCores?: number
    touchSupport?: boolean
  }
  browser?: {
    vendor?: string
  }
}

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number
}

const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/ipad|tablet/.test(userAgent)) {
    return "tablet"
  }

  if (/mobi|android|iphone|ipod/.test(userAgent)) {
    return "mobile"
  }

  return "desktop"
}

export const collectAccessLogInfo = (): AccessLogInfo => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
  languages: Array.from(navigator.languages ?? []),
  platform: navigator.platform,
  userAgent: navigator.userAgent,
  cookiesEnabled: navigator.cookieEnabled,
  screen: {
    width: window.screen?.width,
    height: window.screen?.height,
    pixelRatio: window.devicePixelRatio,
    colorDepth: window.screen?.colorDepth,
  },
  device: {
    type: getDeviceType(),
    memoryGb: (navigator as NavigatorWithDeviceMemory).deviceMemory,
    cpuCores: navigator.hardwareConcurrency,
    touchSupport: navigator.maxTouchPoints > 0,
  },
  browser: {
    vendor: navigator.vendor,
  },
})
