"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, Phone, Calendar, Clock, AlertCircle, ArrowLeft } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

// Safe date formatting helper
function safeFormatDate(dateString: string | undefined | null, formatStr: string, fallback = "N/A"): string {
    if (!dateString) return fallback
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return fallback
        return format(date, formatStr)
    } catch {
        return fallback
    }
}

interface SessionDetails {
    id: string
    title: string
    description: string | null
    scheduledStart: string
    scheduledEnd: string
    price: number
    currency: string
    isFree: boolean
}

type PaymentStep = "details" | "processing" | "success" | "error"

function SessionPaymentContent() {
    const params = useParams()
    const router = useRouter()
    const { user, refreshSession } = useAuth()
    const sessionId = params.sessionId as string

    const [session, setSession] = useState<SessionDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [phone, setPhone] = useState("")
    const [step, setStep] = useState<PaymentStep>("details")
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Fetch session details
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}`)
                if (res.ok) {
                    const data = await res.json()
                    setSession(data)
                } else {
                    setError("Session not found")
                }
            } catch (err) {
                setError("Failed to load session details")
            } finally {
                setIsLoading(false)
            }
        }

        if (sessionId) {
            fetchSession()
        }
    }, [sessionId])

    const handlePayment = async () => {
        if (!user || !session) return

        if (!phone || phone.length < 9) {
            setError("Please enter a valid phone number")
            return
        }

        setError(null)
        setIsProcessing(true)
        setStep("processing")

        try {
            const response = await fetch("/api/payments/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: session.id,
                    phone
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || data.error || "Payment failed")
            }

            const reference = data.reference;

            if (reference) {
                // Polling for status
                const pollInterval = 3000; // 3 seconds
                const maxAttempts = 40; // ~2 minutes
                let attempts = 0;

                const checkStatus = async () => {
                    try {
                        const res = await fetch(`/api/payments/status?reference=${reference}`);
                        if (res.ok) {
                            const statusData = await res.json();
                            if (statusData.status === "success" || statusData.status === "completed") {
                                await refreshSession();
                                setStep("success");
                                return true;
                            } else if (statusData.status === "failed") {
                                throw new Error("Payment was declined or failed. Please try again.");
                            }
                        }
                    } catch (e) {
                        console.error("Polling error:", e);
                        if (e instanceof Error && e.message.includes("failed")) {
                            throw e;
                        }
                    }
                    return false;
                };

                const intervalId = setInterval(async () => {
                    attempts++;
                    const isDone = await checkStatus();
                    if (isDone || attempts >= maxAttempts) {
                        clearInterval(intervalId);
                        if (!isDone) {
                            setError("Payment verification timed out. If you've paid, your access will be granted shortly.");
                            setStep("details");
                            setIsProcessing(false);
                        }
                    }
                }, pollInterval);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
            setStep("error")
            setIsProcessing(false)
        }
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-white">Session not found</p>
                        <Button
                            onClick={() => router.push("/dashboard")}
                            variant="outline"
                            className="mt-4"
                        >
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="text-slate-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                {/* Session Info Card */}
                <Card className="bg-slate-800/50 border-slate-700 mb-6">
                    <CardHeader>
                        <CardTitle className="text-white">{session.title}</CardTitle>
                        {session.description && (
                            <CardDescription className="text-slate-400">
                                {session.description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span>{safeFormatDate(session.scheduledStart, "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span>
                                {safeFormatDate(session.scheduledStart, "p")} - {safeFormatDate(session.scheduledEnd, "p")}
                            </span>
                        </div>

                        {/* Fixed Price Display */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Session Price</span>
                                <Badge variant="secondary" className="text-lg px-3 py-1 bg-green-600/20 text-green-400 border-green-600/30">
                                    {formatCurrency(session.price, session.currency)}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                This is a fixed price and cannot be changed.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Form */}
                {step === "details" && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Pay to Reserve Your Seat</CardTitle>
                            <CardDescription className="text-slate-400">
                                Enter your mobile money number to complete payment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-300">
                                    Mobile Money Number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="0712 345 678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Supported: Vodacom M-Pesa, Airtel Money, Tigo Pesa
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400 text-sm">{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing || !phone}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Pay {formatCurrency(session.price, session.currency)}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Processing State */}
                {step === "processing" && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-12 text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Processing Payment
                            </h3>
                            <p className="text-slate-400">
                                Please check your phone for the payment prompt and enter your PIN.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Success State */}
                {step === "success" && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-12 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Payment Successful!
                            </h3>
                            <p className="text-slate-400 mb-6">
                                Your seat has been reserved for this session.
                            </p>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="bg-gradient-to-r from-green-600 to-emerald-600"
                            >
                                Return to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Error State */}
                {step === "error" && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-12 text-center">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Payment Failed
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {error || "Something went wrong. Please try again."}
                            </p>
                            <Button
                                onClick={() => setStep("details")}
                                variant="outline"
                                className="border-slate-600"
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default function SessionPaymentPage() {
    return (
        <AuthProvider>
            <SessionPaymentContent />
        </AuthProvider>
    )
}
