"use client"

/**
 * After successful login, sessionStorage requests one install prompt.
 * Respects 7-day snooze ("Maybe later") and hides when already installed (standalone).
 */

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  clearLoginInstallFlag,
  detectDeviceKind,
  getIsStandalone,
  readInstallSnoozeExpired,
  readLoginInstallFlag,
  snoozeInstallPromptDays,
} from "@/lib/pwa-utils"
import { usePwaInstall } from "@/components/pwa-install-provider"
import { IOSInstallGuide } from "@/components/IOSInstallGuide"
import Link from "next/link"

export function PostLoginInstallPrompt() {
  const { user, isLoading } = useAuth()
  const { installPwa } = usePwaInstall()
  const [open, setOpen] = useState(false)
  const [iosGuide, setIosGuide] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading || !user) return
    if (getIsStandalone()) return
    if (!readInstallSnoozeExpired()) return
    if (!readLoginInstallFlag()) return
    setOpen(true)
  }, [mounted, isLoading, user])

  const handleLater = () => {
    snoozeInstallPromptDays(7)
    clearLoginInstallFlag()
    setOpen(false)
  }

  const handleInstall = async () => {
    const device = detectDeviceKind()
    if (device === "ios") {
      setIosGuide(true)
      clearLoginInstallFlag()
      setOpen(false)
      return
    }
    const result = await installPwa()
    clearLoginInstallFlag()
    setOpen(false)
    if (result.outcome === "unavailable") {
      window.location.href = "/download"
    }
  }

  if (!mounted || !user) return null
  if (getIsStandalone()) return null

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) clearLoginInstallFlag()
        }}
      >
        <DialogContent className="border-gold/20 sm:max-w-md">
          <DialogHeader className="text-left">
            <div className="mb-2 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-gold/30 object-cover"
              />
              <DialogTitle className="text-navy">Get a better experience</DialogTitle>
            </div>
            <DialogDescription className="text-base text-muted-foreground">
              Install our app for quicker access, your saved session, and a home screen icon — same secure account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" className="w-full bg-gold text-navy hover:bg-gold/90" onClick={handleInstall}>
              Install now
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/download" onClick={() => clearLoginInstallFlag()}>
                Download options
              </Link>
            </Button>
            <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleLater}>
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IOSInstallGuide open={iosGuide} onOpenChange={setIosGuide} rememberDismiss={false} />
    </>
  )
}
