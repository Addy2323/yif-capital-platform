"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react"
import { e164FromTzLocalDigits, normalizePhoneInputToE164, tzLocalDigitsFromPasteOrInput } from "@/lib/phone"
import { toast } from "sonner"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "free"
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  /** 9 digits after +255 (Tanzania mobile) */
  const [phoneLocal, setPhoneLocal] = useState("")
  const [useIntlPhone, setUseIntlPhone] = useState(false)
  const [phoneIntl, setPhoneIntl] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
  ]

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

    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    let phoneE164: string
    if (useIntlPhone) {
      const parsed = normalizePhoneInputToE164(phoneIntl)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      phoneE164 = parsed.e164
    } else {
      const e164 = e164FromTzLocalDigits(phoneLocal)
      if (!e164) {
        setError("Enter all 9 digits of your Tanzania mobile number (e.g. 712 345 678).")
        return
      }
      phoneE164 = e164
    }

    setIsLoading(true)

    const result = await register(email, password, name, phoneE164)

    if (result.success) {
      sessionStorage.setItem("otp_verify_phone", phoneE164)
      sessionStorage.setItem("otp_verify_expires", result.expiresAt)
      sessionStorage.setItem("otp_verify_masked", result.maskedPhone)
      toast.success("Account created. Check your phone for the verification code.")
      router.push("/verify-otp")
    } else {
      toast.error(result.error || "Registration failed.")
      setError(result.error || "An error occurred")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-navy lg:flex lg:flex-col lg:justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="YIF Capital" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
            <span className="text-2xl font-bold text-white">YIF Capital</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight text-balance">
            Start Your Investment Journey Today
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Create your account and get instant access to market data, analytics, and educational resources.
          </p>

          {plan === "pro" && (
            <div className="rounded-xl border border-gold/30 bg-gold/10 p-6">
              <p className="text-gold font-semibold">Pro Plan Selected</p>
              <p className="mt-2 text-white/70 text-sm">
                You'll get a 14-day free trial with full access to all Pro features.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-white/50 text-sm">What you'll get:</p>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Real-time market data
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Professional charting tools
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Investment courses
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Portfolio tracking
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <span className="text-xl font-bold text-navy">YIF Capital</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-muted-foreground">Get started with a free account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                  autoComplete="name"
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  autoComplete="email"
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                {!useIntlPhone ? (
                  <>
                    <div className="flex h-12 overflow-hidden rounded-md border border-input bg-background shadow-xs ring-offset-background focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2">
                      <span
                        className="inline-flex shrink-0 items-center border-r border-input bg-muted/70 px-3 text-sm font-medium text-foreground tabular-nums select-none"
                        aria-hidden
                      >
                        +255
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="712 345 678"
                        value={phoneLocal}
                        onChange={(e) =>
                          setPhoneLocal(tzLocalDigitsFromPasteOrInput(e.target.value))
                        }
                        required
                        className="h-12 flex-1 min-w-0 border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        suppressHydrationWarning
                        aria-describedby="phone-hint"
                      />
                    </div>
                    <p id="phone-hint" className="text-xs text-muted-foreground leading-relaxed">
                      Enter your Tanzanian mobile number only — the <strong className="text-foreground/90">255</strong>{" "}
                      country code is added for you. You can paste formats like{" "}
                      <span className="whitespace-nowrap">0712…</span> or{" "}
                      <span className="whitespace-nowrap">712…</span>. We&apos;ll send a verification SMS.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setUseIntlPhone(true)
                        setPhoneLocal("")
                      }}
                      className="text-xs font-medium text-gold hover:text-gold/80 underline-offset-2 hover:underline"
                    >
                      My number is not in Tanzania
                    </button>
                  </>
                ) : (
                  <>
                    <Input
                      id="phone-intl"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+256 7… or +44 7…"
                      value={phoneIntl}
                      onChange={(e) => setPhoneIntl(e.target.value)}
                      required
                      className="h-12"
                      suppressHydrationWarning
                      aria-describedby="phone-intl-hint"
                    />
                    <p id="phone-intl-hint" className="text-xs text-muted-foreground">
                      Include country code with <strong className="text-foreground/90">+</strong> (international
                      format). SMS is sent via our gateway the same way.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setUseIntlPhone(false)
                        setPhoneIntl("")
                      }}
                      className="text-xs font-medium text-gold hover:text-gold/80 underline-offset-2 hover:underline"
                    >
                      Use Tanzania (+255) instead
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                    autoComplete="new-password"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${req.met ? "text-success" : "text-muted-foreground"
                        }`}
                    >
                      <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12"
                  autoComplete="new-password"
                  suppressHydrationWarning
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="text-gold hover:text-gold/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-gold hover:text-gold/80">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-gold text-navy hover:bg-gold/90"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gold hover:text-gold/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <RegisterForm />
  )
}
