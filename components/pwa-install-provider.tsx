"use client"

/**
 * Captures Chromium's `beforeinstallprompt` once and exposes `installPwa()`
 * for the banner, /download page, and post-login modal.
 * iOS Safari does not fire this event — use Add to Home Screen instructions instead.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type PwaInstallContextValue = {
  /** Chromium install prompt, if the browser offered one */
  deferredPrompt: BeforeInstallPromptEventLike | null
  /** Runs `prompt()` and clears the deferred event after user responds */
  installPwa: () => Promise<{ outcome: "accepted" | "dismissed" | "unavailable" }>
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null)

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEventLike | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEventLike)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const installPwa = useCallback(async () => {
    if (!deferredPrompt) {
      return { outcome: "unavailable" as const }
    }
    const p = deferredPrompt
    setDeferredPrompt(null)
    await p.prompt()
    const choice = await p.userChoice
    return { outcome: choice.outcome }
  }, [deferredPrompt])

  return (
    <PwaInstallContext.Provider value={{ deferredPrompt, installPwa }}>
      {children}
    </PwaInstallContext.Provider>
  )
}

export function usePwaInstall() {
  const ctx = useContext(PwaInstallContext)
  if (!ctx) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider")
  }
  return ctx
}
