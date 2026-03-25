/**
 * Shared PWA helpers (safe when `window` is undefined — always guard callers).
 * Used by install banner, download page, and post-login prompt.
 */

/** localStorage: user closed the bottom install banner */
export const LS_INSTALL_BANNER_DISMISSED = "yif_install_banner_dismissed"
/** localStorage: "Maybe later" on post-login modal — ISO timestamp when snooze ends */
export const LS_INSTALL_PROMPT_SNOOZE_UNTIL = "yif_pwa_install_snooze_until"
/** sessionStorage: set on successful login to show one-time install modal */
export const SS_LOGIN_INSTALL_FLAG = "yif_pwa_login_prompt"
/** localStorage: iOS guide sheet dismissed */
export const LS_IOS_GUIDE_DISMISSED = "yif_ios_install_guide_dismissed"

export type DeviceKind = "ios" | "android" | "desktop" | "other"

export function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false
  const mq = window.matchMedia("(display-mode: standalone)")
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return mq.matches || nav.standalone === true
}

export function detectDeviceKind(): DeviceKind {
  if (typeof window === "undefined") return "other"
  const ua = window.navigator.userAgent || ""
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" && (window.navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1)
  if (isIOS) return "ios"
  if (/Android/i.test(ua)) return "android"
  if (/Windows|Macintosh|Linux|X11|CrOS/i.test(ua) && !/Mobile/i.test(ua)) return "desktop"
  return "other"
}

export function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent || ""
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  if (!isIOS) return false
  // iOS Chrome / Firefox use different engines; Add to Home Screen is a Safari feature
  const isWebkit = /WebKit/i.test(ua)
  const notChrome = !/CriOS|FxiOS|EdgiOS/i.test(ua)
  return isWebkit && notChrome
}

export function readBannerDismissed(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(LS_INSTALL_BANNER_DISMISSED) === "1"
  } catch {
    return false
  }
}

export function setBannerDismissed(): void {
  try {
    window.localStorage.setItem(LS_INSTALL_BANNER_DISMISSED, "1")
  } catch {
    /* ignore quota */
  }
}

export function readInstallSnoozeExpired(): boolean {
  if (typeof window === "undefined") return true
  try {
    const raw = window.localStorage.getItem(LS_INSTALL_PROMPT_SNOOZE_UNTIL)
    if (!raw) return true
    const until = new Date(raw).getTime()
    return Number.isNaN(until) || Date.now() >= until
  } catch {
    return true
  }
}

export function snoozeInstallPromptDays(days: number): void {
  try {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    window.localStorage.setItem(LS_INSTALL_PROMPT_SNOOZE_UNTIL, until)
  } catch {
    /* ignore */
  }
}

export function readLoginInstallFlag(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(SS_LOGIN_INSTALL_FLAG) === "1"
  } catch {
    return false
  }
}

export function clearLoginInstallFlag(): void {
  try {
    window.sessionStorage.removeItem(SS_LOGIN_INSTALL_FLAG)
  } catch {
    /* ignore */
  }
}

export function setLoginInstallFlag(): void {
  try {
    window.sessionStorage.setItem(SS_LOGIN_INSTALL_FLAG, "1")
  } catch {
    /* ignore */
  }
}
