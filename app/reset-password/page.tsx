"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, CheckCircle2, Lock, ShieldCheck, AlertTriangle, Check } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"loading" | "form" | "success" | "invalid">("loading")
  const [redirectCount, setRedirectCount] = useState(5)

  // Determine initial step based on token presence — runs after mount
  useEffect(() => {
    if (token) {
      setStep("form")
    } else {
      setStep("invalid")
    }
  }, [token])

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ]

  const passwordStrength = passwordRequirements.filter((r) => r.met).length
  const strengthLabel = passwordStrength === 0 ? "" : passwordStrength === 1 ? "Weak" : passwordStrength === 2 ? "Fair" : "Strong"
  const strengthColor = passwordStrength === 1 ? "bg-error" : passwordStrength === 2 ? "bg-warning" : passwordStrength === 3 ? "bg-success" : "bg-border"

  // Auto-redirect after success
  useEffect(() => {
    if (step === "success" && redirectCount > 0) {
      const timer = setTimeout(() => setRedirectCount(redirectCount - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (step === "success" && redirectCount === 0) {
      window.location.href = "/login"
    }
  }, [step, redirectCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("Please meet all password requirements")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && (data.error?.includes("expired") || data.error?.includes("invalid") || data.error?.includes("Invalid"))) {
          setStep("invalid")
        } else {
          setError(data.error || "Something went wrong")
        }
      } else {
        setStep("success")
      }
    } catch {
      setError("Network error. Please try again.")
    }

    setIsLoading(false)
  }

  // Loading state while token is being read
  if (step === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-muted-foreground text-sm font-medium">Validating reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 bg-navy lg:flex lg:flex-col lg:justify-between p-16 overflow-hidden">
        {/* Background Decoratives */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/logo%20payment/background/academy.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          {/* Animated floating orbs */}
          <div className="absolute top-[25%] left-[35%] w-3 h-3 rounded-full bg-gold/30 animate-float" />
          <div className="absolute top-[55%] left-[25%] w-2 h-2 rounded-full bg-gold/20 animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-[45%] left-[65%] w-4 h-4 rounded-full bg-gold/15 animate-float" style={{ animationDelay: "2.5s" }} />
        </div>

        <div className="relative z-10">
          <Link href="/academy" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-md group-hover:blur-lg transition-all" />
              <Image src="/logo.png" alt="YIF Capital" width={64} height={64} className="relative h-16 w-16 rounded-full object-cover border-2 border-gold/30" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">YIF Capital</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Reset
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] text-balance">
              Create a New
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold/80 to-gold/60"> Secure Password</span>
            </h1>
          </div>
          <p className="text-xl text-white/70 leading-relaxed font-light">
            Choose a strong, unique password to protect your YIF Capital account. We recommend using a mix of letters, numbers, and symbols.
          </p>

          {/* Security Tips */}
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-6 space-y-3">
            <p className="text-gold font-semibold text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password Security Tips
            </p>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                Use at least 8 characters with mixed case
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                Include numbers and special characters
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                Avoid using personal information
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
            <div className="h-1 w-1 rounded-full bg-gold/50" />
            <span>Bank-grade Security</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md space-y-10">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Link href="/academy" className="flex items-center gap-3">
              <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover border border-gold/20" />
              <span className="text-xl font-bold text-navy">YIF Capital</span>
            </Link>
          </div>

          {step === "form" ? (
            /* ─── NEW PASSWORD FORM ─── */
            <div className="animate-scale-in">
              {/* Animated Lock Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                    <Lock className="h-9 w-9 text-gold" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Set new password</h2>
                <p className="text-muted-foreground text-lg">
                  Create a strong password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80 ml-1">New Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-gold transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-14 bg-background/50 border-border/50 focus:border-gold/50 focus:ring-gold/20 transition-all text-base pl-12 pr-14 rounded-xl"
                        autoComplete="new-password"
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-gold transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Password Strength Bar */}
                    {password.length > 0 && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <div className="flex gap-1.5">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength ? strengthColor : "bg-border"
                                }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-semibold ${passwordStrength === 1 ? "text-error" : passwordStrength === 2 ? "text-warning" : passwordStrength === 3 ? "text-success" : "text-muted-foreground"
                          }`}>
                          {strengthLabel}
                        </p>
                      </div>
                    )}

                    {/* Password Requirements */}
                    <div className="mt-3 space-y-2">
                      {passwordRequirements.map((req) => (
                        <div
                          key={req.label}
                          className={`flex items-center gap-2 text-xs transition-colors duration-300 ${req.met ? "text-success" : "text-muted-foreground"
                            }`}
                        >
                          <div className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${req.met
                              ? "bg-success border-success"
                              : "border-border"
                            }`}>
                            {req.met && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80 ml-1">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-gold transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-14 bg-background/50 border-border/50 focus:border-gold/50 focus:ring-gold/20 transition-all text-base pl-12 pr-14 rounded-xl"
                        autoComplete="new-password"
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-gold transition-colors p-1"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <p className={`text-xs font-medium mt-1 ml-1 transition-colors ${password === confirmPassword ? "text-success" : "text-error"
                        }`}>
                        {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full bg-gradient-to-r from-gold to-gold/80 text-navy font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 gap-2 overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">Reset Password</span>
                      <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors font-medium group">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : step === "success" ? (
            /* ─── SUCCESS STATE ─── */
            <div className="animate-scale-in text-center">
              {/* Animated Checkmark */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success/20 to-success/5 border border-success/30 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-success animate-bounce-subtle" />
                  </div>
                  {/* Celebrate particles */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-gold/70 animate-bounce-subtle" />
                  <div className="absolute -bottom-1 -left-2 w-2 h-2 rounded-full bg-success/70 animate-bounce-subtle" style={{ animationDelay: "0.3s" }} />
                  <div className="absolute top-0 -left-3 w-2 h-2 rounded-full bg-gold/50 animate-bounce-subtle" style={{ animationDelay: "0.6s" }} />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Password Updated!</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>

              <div className="mt-8">
                <Link href="/login">
                  <Button className="h-14 w-full bg-gradient-to-r from-gold to-gold/80 text-navy font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 gap-2 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    <span className="relative z-10">Sign In Now</span>
                    <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="mt-4 text-muted-foreground text-sm">
                  Redirecting in <span className="text-gold font-bold">{redirectCount}s</span>
                </p>
              </div>
            </div>
          ) : (
            /* ─── INVALID / EXPIRED TOKEN ─── */
            <div className="animate-scale-in text-center">
              {/* Warning Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-warning/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-warning" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Invalid Reset Link</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Link href="/forgot-password">
                  <Button className="h-14 w-full bg-gradient-to-r from-gold to-gold/80 text-navy font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 gap-2 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    <span className="relative z-10">Request New Link</span>
                    <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors font-medium group">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-muted-foreground text-sm font-medium">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
