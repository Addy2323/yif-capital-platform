"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      if (redirect) {
        router.push(redirect)
      } else {
        window.location.href = "/"
      }
    } else {
      setError(result.error || "An error occurred")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 bg-navy lg:flex lg:flex-col lg:justify-between p-16 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/logo%20payment/background/academy.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
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
              <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
              Institutional Grade Platform
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] text-balance">
              Your Gateway to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold/80 to-gold/60"> Tanzanian Capital Markets</span>
            </h1>
          </div>
          <p className="text-xl text-white/70 leading-relaxed font-light">
            Access institutional-grade market data, professional analytics, and world-class investment education all in one unified ecosystem.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-8 text-white/40 text-sm font-medium">
            {/* <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gold/50" />
              <span></span>
            </div> */}
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gold/50" />
              <span>Bank-grade Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md space-y-10">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover border border-gold/20" />
              <span className="text-xl font-bold text-navy">YIF Capital</span>
            </Link>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-lg">Sign in to your professional account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 bg-background/50 border-border/50 focus:border-gold/50 focus:ring-gold/20 transition-all text-base px-4 rounded-xl"
                  autoComplete="email"
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-gold hover:text-gold/80 transition-colors uppercase tracking-wider">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 bg-background/50 border-border/50 focus:border-gold/50 focus:ring-gold/20 transition-all text-base px-4 pr-14 rounded-xl"
                    autoComplete="current-password"
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
                  <span className="relative z-10">Sign In to Dashboard</span>
                  <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-muted-foreground font-medium">
              New to YIF Capital?{" "}
              <Link href="/register" className="text-gold hover:text-gold/80 hover:underline underline-offset-4 transition-all">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <LoginForm />
  )
}
