"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2, Mail, ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [step, setStep] = useState<"email" | "sent">("email")
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Something went wrong")
            } else {
                setStep("sent")
                setCooldown(60)
            }
        } catch {
            setError("Network error. Please try again.")
        }

        setIsLoading(false)
    }

    const handleResend = async () => {
        if (cooldown > 0) return
        setIsLoading(true)

        try {
            await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            setCooldown(60)
        } catch {
            // silently fail resend
        }

        setIsLoading(false)
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
                    <div className="absolute top-[20%] left-[40%] w-3 h-3 rounded-full bg-gold/30 animate-float" />
                    <div className="absolute top-[60%] left-[20%] w-2 h-2 rounded-full bg-gold/20 animate-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute top-[40%] left-[70%] w-4 h-4 rounded-full bg-gold/15 animate-float" style={{ animationDelay: "2s" }} />
                    <div className="absolute top-[80%] left-[60%] w-2 h-2 rounded-full bg-gold/25 animate-float" style={{ animationDelay: "0.5s" }} />
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
                            Account Recovery
                        </div>
                        <h1 className="text-5xl font-extrabold text-white leading-[1.1] text-balance">
                            Secure Password
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold/80 to-gold/60"> Recovery</span>
                        </h1>
                    </div>
                    <p className="text-xl text-white/70 leading-relaxed font-light">
                        Don&apos;t worry, it happens to the best of us. We&apos;ll send you a secure link to reset your password and get you back to your account.
                    </p>

                    {/* Security Steps */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Step 1: Enter your email</p>
                                <p className="text-white/50 text-sm">We&apos;ll verify your account exists</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Step 2: Check your inbox</p>
                                <p className="text-white/50 text-sm">Click the secure reset link</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Step 3: Create new password</p>
                                <p className="text-white/50 text-sm">Set a strong, secure password</p>
                            </div>
                        </div>
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

                    {step === "email" ? (
                        /* ─── STEP 1: EMAIL INPUT ─── */
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
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">Forgot your password?</h2>
                                <p className="text-muted-foreground text-lg">
                                    Enter the email address associated with your account and we&apos;ll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                {error && (
                                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">Email address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-gold transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-14 bg-background/50 border-border/50 focus:border-gold/50 focus:ring-gold/20 transition-all text-base pl-12 pr-4 rounded-xl"
                                            autoComplete="email"
                                            suppressHydrationWarning
                                        />
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
                                            <span className="relative z-10">Send Reset Link</span>
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
                    ) : (
                        /* ─── STEP 2: EMAIL SENT CONFIRMATION ─── */
                        <div className="animate-scale-in text-center">
                            {/* Animated Success Icon */}
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
                                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success/20 to-success/5 border border-success/30 flex items-center justify-center">
                                        <div className="animate-check-bounce">
                                            <Mail className="h-11 w-11 text-success" />
                                        </div>
                                    </div>
                                    {/* Orbiting particles */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold/60 animate-bounce-subtle" />
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-success/60 animate-bounce-subtle" style={{ animationDelay: "0.3s" }} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">Check your email</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    We&apos;ve sent a password reset link to
                                </p>
                                <p className="text-gold font-semibold text-lg">{email}</p>
                                <p className="text-muted-foreground text-sm mt-4">
                                    The link will expire in 1 hour. Check your spam folder if you don&apos;t see the email.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Didn&apos;t receive it?</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            <Button
                                onClick={handleResend}
                                disabled={cooldown > 0 || isLoading}
                                variant="outline"
                                className="h-12 w-full rounded-xl border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all font-semibold"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : cooldown > 0 ? (
                                    <span>Resend in {cooldown}s</span>
                                ) : (
                                    <span>Resend Email</span>
                                )}
                            </Button>

                            <div className="pt-6">
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
