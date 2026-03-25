"use client"

/**
 * Floating bottom install bar: Android/Desktop uses native install prompt when available;
 * iOS shows Share → Add to Home Screen hint. Dismiss persists in localStorage.
 * Shown: homepage for guests only, dashboard for logged-in users (not when already installed).
 */

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  detectDeviceKind,
  getIsStandalone,
  readBannerDismissed,
  setBannerDismissed,
} from "@/lib/pwa-utils"
import { usePwaInstall } from "@/components/pwa-install-provider"
import { IOSInstallGuide } from "@/components/IOSInstallGuide"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function InstallAppBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const { deferredPrompt, installPwa } = usePwaInstall()
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [iosGuideOpen, setIosGuideOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDismissed(readBannerDismissed())
  }, [])

  const isHome = pathname === "/"
  const isDashboard = pathname?.startsWith("/dashboard") ?? false

  const showForGuestOnHome = isHome && !user && !isLoading
  const showForUserOnDashboard = isDashboard && !!user && !isLoading
  const shouldShow = mounted && !dismissed && (showForGuestOnHome || showForUserOnDashboard)

  const installed = mounted && getIsStandalone()
  if (!mounted || installed || !shouldShow) {
    return null
  }

  const device = detectDeviceKind()
  const isIOS = device === "ios"
  const isAndroid = device === "android"
  const canChromiumInstall = !!deferredPrompt

  const handlePrimary = async () => {
    if (isIOS) {
      setIosGuideOpen(true)
      return
    }
    const result = await installPwa()
    if (result.outcome === "unavailable") {
      router.push("/download")
    }
  }

  const label =
    isIOS
      ? "How to install"
      : isAndroid && canChromiumInstall
        ? "Install app"
        : !isIOS && canChromiumInstall
          ? "Install desktop app"
          : "Download app"

  const sub =
    isIOS
      ? "Safari: Share → Add to Home Screen"
      : canChromiumInstall
        ? "Add YIF Capital to your home screen"
        : "Get the app — same account, faster access"

  /** On mobile home, sit above the bottom tab bar (sm:hidden nav ~72px) */
  const bottomOffset = isHome ? "bottom-[76px] sm:bottom-0" : "bottom-0"

  return (
    <>
      <div
        className={cn(
          "fixed left-0 right-0 z-[55] border-t border-gold/20 bg-navy/95 px-3 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          bottomOffset,
        )}
        role="region"
        aria-label="Install app"
      >
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full border border-gold/30 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{label}</p>
            <p className="line-clamp-2 text-xs text-white/75">{sub}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-gold text-navy hover:bg-gold/90"
              onClick={handlePrimary}
            >
              {label}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-white/80 hover:bg-white/10"
              asChild
            >
              <Link href="/download" aria-label="More download options">
                More
              </Link>
            </Button>
            <button
              type="button"
              className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
              onClick={() => {
                setBannerDismissed()
                setDismissed(true)
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <IOSInstallGuide open={iosGuideOpen} onOpenChange={setIosGuideOpen} />
    </>
  )
}
