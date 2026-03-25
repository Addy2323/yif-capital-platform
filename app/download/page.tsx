"use client"

/**
 * Public /download — Android (Chrome install), iOS (Add to Home Screen).
 * Highlights the card matching the current device; QR links to this page for mobile.
 */

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Download, Smartphone } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  detectDeviceKind,
  getIsStandalone,
} from "@/lib/pwa-utils"
import { usePwaInstall } from "@/components/pwa-install-provider"
import { IOSInstallGuide } from "@/components/IOSInstallGuide"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yifcapital.co.tz"

export default function DownloadPage() {
  const { deferredPrompt, installPwa } = usePwaInstall()
  const [mounted, setMounted] = useState(false)
  const [iosOpen, setIosOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const device = mounted ? detectDeviceKind() : "other"
  const installed = mounted && getIsStandalone()

  const origin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin
    return SITE_URL.replace(/\/$/, "")
  }, [])

  const qrSrc = `${"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="}${encodeURIComponent(`${origin}/download`)}`

  const highlight = (kind: "android" | "ios") => {
    if (!mounted || installed) return false
    if (kind === "android") return device === "android"
    return device === "ios"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="YIF Capital"
                width={80}
                height={80}
                className="h-20 w-20 rounded-full border-2 border-gold/30 object-cover shadow-lg"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">Download the YIF Capital app</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Install once — get the same platform with an app icon on your phone&apos;s home screen.
            </p>
            {installed && (
              <p className="text-sm font-medium text-green-600">
                You&apos;re already using the installed app.
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Android */}
            <section
              className={cn(
                "rounded-2xl border bg-card p-6 shadow-sm transition-shadow",
                highlight("android") && "ring-2 ring-gold shadow-md",
              )}
            >
              <div className="mb-4 flex items-center gap-2 text-2xl" aria-hidden>
                <Smartphone className="h-8 w-8 text-gold" />
                <span>Android</span>
              </div>
              <h2 className="text-lg font-semibold text-navy">Install from browser</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Open this site in <strong className="font-medium text-foreground">Chrome</strong> on your phone. When
                your browser offers it, tap to add YIF Capital to your home screen — same account, app-style icon.
              </p>
              <Button
                type="button"
                className="mt-6 w-full bg-gold text-navy hover:bg-gold/90"
                onClick={() => void installPwa()}
              >
                Install from browser
              </Button>
              {!deferredPrompt && device === "android" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  If you don&apos;t see a prompt yet, use Chrome&apos;s menu (⋮) and look for <strong>Install app</strong> or{" "}
                  <strong>Add to Home screen</strong>.
                </p>
              )}
            </section>

            {/* iOS */}
            <section
              className={cn(
                "rounded-2xl border bg-card p-6 shadow-sm transition-shadow",
                highlight("ios") && "ring-2 ring-gold shadow-md",
              )}
            >
              <div className="mb-4 flex items-center gap-2 text-2xl" aria-hidden>
                <span className="text-2xl">🍎</span>
                <span>iPhone & iPad</span>
              </div>
              <h2 className="text-lg font-semibold text-navy">Safari — Add to Home Screen</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Apple doesn&apos;t allow a one-tap install from the web. Use Safari and add this site to your home screen.
              </p>
              <Button type="button" className="mt-6 w-full bg-navy text-white hover:bg-navy/90" onClick={() => setIosOpen(true)}>
                Show step-by-step guide
              </Button>
            </section>
          </div>

          {/* QR */}
          <section className="rounded-2xl border border-dashed border-gold/30 bg-muted/30 p-8 text-center">
            <h2 className="text-lg font-semibold text-navy">Scan to install on mobile</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Point your camera at this code to open the download page on your phone.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- external QR API */}
              <img src={qrSrc} alt="" width={220} height={220} className="rounded-xl bg-white p-2 shadow" />
              <p className="break-all text-xs text-muted-foreground">{origin}/download</p>
            </div>
          </section>

          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <Download className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <IOSInstallGuide open={iosOpen} onOpenChange={setIosOpen} rememberDismiss={false} />
    </div>
  )
}
