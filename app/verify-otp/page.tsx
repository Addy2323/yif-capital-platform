"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

const RESEND_COOLDOWN_MS = 45_000
const STORAGE_PHONE = "otp_verify_phone"
const STORAGE_EXPIRES = "otp_verify_expires"
const STORAGE_MASKED = "otp_verify_masked"

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00"
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function VerifyOtpPage() {
  const router = useRouter()
  const { refreshSession } = useAuth()
  const [phone, setPhone] = useState<string | null>(null)
  const [maskedPhone, setMaskedPhone] = useState("")
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [tick, setTick] = useState(0)
  const [otpExpired, setOtpExpired] = useState(false)
  const [resendCooldownUntil, setResendCooldownUntil] = useState(0)
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const autoSubmitFor = useRef<string | null>(null)
  const initialCooldownDone = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const p = sessionStorage.getItem(STORAGE_PHONE)
    const exp = sessionStorage.getItem(STORAGE_EXPIRES)
    const masked = sessionStorage.getItem(STORAGE_MASKED) || ""
    if (!p || !exp) {
      router.replace("/register")
      return
    }
    setPhone(p)
    setExpiresAt(exp)
    setMaskedPhone(masked)
  }, [router])

  useEffect(() => {
    if (phone && expiresAt && !initialCooldownDone.current) {
      initialCooldownDone.current = true
      setResendCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
    }
  }, [phone, expiresAt])

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remainingMs = useMemo(() => {
    if (!expiresAt) return 0
    return new Date(expiresAt).getTime() - Date.now()
  }, [expiresAt, tick])

  useEffect(() => {
    if (remainingMs <= 0 && expiresAt) {
      setOtpExpired(true)
    } else if (remainingMs > 0) {
      setOtpExpired(false)
    }
  }, [remainingMs, expiresAt])

  const resendCooldownLeft = Math.max(0, resendCooldownUntil - Date.now())

  const verify = useCallback(async () => {
    if (!phone || otp.length !== 6 || otpExpired) return
    setError("")
    setIsVerifying(true)
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || "Verification failed"
        setError(msg)
        toast.error(msg)
        setOtp("")
        return
      }
      sessionStorage.removeItem(STORAGE_PHONE)
      sessionStorage.removeItem(STORAGE_EXPIRES)
      sessionStorage.removeItem(STORAGE_MASKED)
      toast.success("Phone verified! You're signed in.")
      await refreshSession()
      router.push("/")
    } catch {
      setError("Network error. Try again.")
      toast.error("Network error. Try again.")
    } finally {
      setIsVerifying(false)
    }
  }, [phone, otp, otpExpired, refreshSession, router])

  useEffect(() => {
    if (otp.length < 6) autoSubmitFor.current = null
  }, [otp])

  useEffect(() => {
    if (otp.length !== 6 || otpExpired || isVerifying) return
    if (autoSubmitFor.current === otp) return
    autoSubmitFor.current = otp
    void verify()
  }, [otp, otpExpired, isVerifying, verify])

  const handleResend = async () => {
    if (!phone || resendCooldownLeft > 0 || isResending) return
    setError("")
    setIsResending(true)
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || "Could not resend code"
        setError(msg)
        toast.error(msg)
        return
      }
      if (data.expiresAt) {
        sessionStorage.setItem(STORAGE_EXPIRES, data.expiresAt)
        setExpiresAt(data.expiresAt)
        setOtpExpired(false)
        setOtp("")
        setResendCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
        toast.success("A new code was sent to your phone.")
      } else if (data.message) {
        toast.message(data.message)
      }
    } catch {
      setError("Network error. Try again.")
      toast.error("Network error. Try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (!phone || !expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const verifyDisabled = otp.length !== 6 || otpExpired || isVerifying

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-navy lg:flex lg:flex-col lg:justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="YIF Capital" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
          <span className="text-2xl font-bold text-white">YIF Capital</span>
        </Link>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white text-balance">Verify your phone</h1>
          <p className="text-white/70">This helps keep your account secure.</p>
        </div>
        <p className="text-white/40 text-sm">SMS rates may apply from your carrier.</p>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <span className="text-xl font-bold text-navy">YIF Capital</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Enter verification code</h2>
            <p className="text-muted-foreground">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{maskedPhone || "your phone"}</span>
            </p>
          </div>

          <motion.div
            className="mt-8 space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Code expires in{" "}
                <span
                  className={
                    otpExpired || remainingMs <= 0
                      ? "text-destructive tabular-nums"
                      : "text-gold tabular-nums"
                  }
                >
                  {otpExpired || remainingMs <= 0 ? "0:00" : formatRemaining(remainingMs)}
                </span>
              </p>
              {otpExpired && (
                <p className="text-sm text-destructive">This code has expired. Request a new one below.</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
            )}

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => setOtp(v.replace(/\D/g, ""))}
                disabled={isVerifying}
                containerClassName="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-12 w-11 rounded-md border text-lg shadow-sm transition-all data-[active=true]:ring-2 data-[active=true]:ring-gold/40"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={verifyDisabled}
                onClick={() => void verify()}
                className="h-12 flex-1 bg-gold text-navy hover:bg-gold/90"
              >
                {isVerifying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify & continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isResending || resendCooldownLeft > 0}
                onClick={() => void handleResend()}
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : resendCooldownLeft > 0 ? (
                  `Resend code (${Math.ceil(resendCooldownLeft / 1000)}s)`
                ) : (
                  "Resend code"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your signal and try resend. Max 3 SMS per minute.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Wrong number?{" "}
              <Link href="/register" className="font-medium text-gold hover:text-gold/80">
                Start over
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
