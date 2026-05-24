"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import {
  ArrowLeft,
  GraduationCap,
  Smartphone,
  Building2,
  ShieldCheck,
  Clock,
  CheckCircle,
} from "lucide-react"

export default function CourseCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "BANK">("MOBILE_MONEY")
  const [mobileNumber, setMobileNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentRef, setPaymentRef] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiated" | "success" | "failed">("idle")
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    fetch(`/api/lms/courses/${courseId}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setCourse(data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [courseId, user, router])

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const startPolling = useCallback((reference: string) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${reference}`)
        const data = await res.json()
        if (data.status === "success") {
          setPaymentStatus("success")
          if (pollRef.current) clearInterval(pollRef.current)
          toast.success("Payment confirmed! Redirecting to your courses...")
          setTimeout(() => router.push(`/lms/courses`), 2000)
        } else if (data.status === "failed") {
          setPaymentStatus("failed")
          if (pollRef.current) clearInterval(pollRef.current)
          toast.error("Payment failed. Please try again.")
        }
      } catch {}
    }, 3000)
  }, [courseId, router])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "MOBILE_MONEY" && !mobileNumber.trim()) {
      toast.error("Please enter your mobile number")
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch("/api/payments/initiate/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          phone: mobileNumber,
          amount: course.price,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setPaymentRef(data.reference)
        setPaymentStatus("initiated")
        toast.success("Payment initiated! Please check your phone for the push prompt.")
        startPolling(data.reference)
      } else {
        toast.error(data.error || "Failed to initiate payment")
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Course not found.</p>
          <Button asChild><Link href="/courses">Browse Courses</Link></Button>
        </div>
        <Footer />
      </div>
    )
  }

  const total = course.price

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <h1 className="text-2xl font-bold mb-6">Complete Your Enrollment</h1>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePay} className="space-y-5">
                    {/* Method selector */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("MOBILE_MONEY")}
                        className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                          paymentMethod === "MOBILE_MONEY"
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Smartphone className="h-4 w-4 shrink-0" /> Mobile Money
                      </button>
                      <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium opacity-50 cursor-not-allowed text-muted-foreground"
                      >
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span>Bank Transfer</span>
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground border-none">
                          Coming Soon
                        </Badge>
                      </button>
                    </div>

                    {paymentMethod === "MOBILE_MONEY" && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/70">
                          Mobile Number (M-Pesa / Tigo / Airtel)
                        </label>
                        <input
                          type="tel"
                          placeholder="+255 712 345 678"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                          value={mobileNumber}
                          onChange={e => setMobileNumber(e.target.value)}
                          required
                        />
                        <p className="text-[11px] text-muted-foreground">
                          You will receive a push notification to confirm payment.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "BANK" && (
                      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1.5 text-sm">
                        <p className="font-semibold text-foreground">Bank Transfer Details</p>
                        <p className="text-muted-foreground">Bank: <span className="text-foreground font-medium">CRDB Bank Plc</span></p>
                        <p className="text-muted-foreground">Account: <span className="text-foreground font-mono">0150123456789</span></p>
                        <p className="text-muted-foreground">Name: <span className="text-foreground font-medium">YIF Capital Ltd</span></p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Use your name + course title as the payment reference. Enrollment activates within 24 hours.
                        </p>
                      </div>
                    )}

                    <Separator />

                    {paymentStatus === "success" ? (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                        <p className="font-semibold text-emerald-600">Payment Confirmed!</p>
                        <p className="text-xs text-muted-foreground">Redirecting to your course…</p>
                      </div>
                    ) : paymentStatus === "initiated" ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-gold/30 bg-gold/10 p-4 text-center space-y-2">
                          <Clock className="h-6 w-6 text-gold mx-auto animate-spin" />
                          <p className="font-semibold text-sm">Awaiting Payment Confirmation</p>
                          <p className="text-xs text-muted-foreground">Check your phone and confirm the payment prompt.</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => { setPaymentStatus("idle"); setPaymentRef(null); if (pollRef.current) clearInterval(pollRef.current) }}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : paymentStatus === "failed" ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center space-y-1">
                          <p className="font-semibold text-red-500">Payment Failed</p>
                          <p className="text-xs text-muted-foreground">Please try again or use a different number.</p>
                        </div>
                        <Button
                          type="button"
                          className="w-full h-11 bg-gold text-navy hover:bg-gold/90 font-semibold"
                          onClick={() => setPaymentStatus("idle")}
                        >
                          Retry Payment
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-11 bg-gold text-navy hover:bg-gold/90 font-semibold"
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 animate-spin" /> Processing…
                            </span>
                          ) : (
                            `Pay TZS ${total.toLocaleString()}`
                          )}
                        </Button>

                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          Secured by YIF Capital · 256-bit encryption
                        </div>
                      </>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course thumbnail */}
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-lg bg-navy flex items-center justify-center shrink-0 overflow-hidden">
                      {course.thumbnailUrl
                        ? <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        : <GraduationCap className="h-7 w-7 text-gold/50" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold line-clamp-2">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {course.expert?.user?.name}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Course price</span>
                      <span>TZS {course.price?.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-gold">TZS {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                    {[
                      "Lifetime access to all lessons",
                      "Certificate of completion",
                      "30-day money-back guarantee",
                    ].map(item => (
                      <div key={item} className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
