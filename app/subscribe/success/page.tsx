"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { formatCurrency } from "@/lib/payment-service"
import { fetchPricingPlans, type PricingPlan, initialPlans } from "@/lib/pricing-data"
import { Button } from "@/components/ui/button"
import {
    Check,
    Download,
    Share2,
    Crown,
    Calendar,
    CreditCard,
    Smartphone,
    Receipt,
    ArrowRight,
} from "lucide-react"

function SuccessContent() {
    const { user } = useAuth()
    const [transaction, setTransaction] = useState<any>(null)
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(initialPlans)

    useEffect(() => {
        fetchPricingPlans().then(setPricingPlans)
    }, [])

    // Get the price for the user's current plan
    const getPlanPrice = () => {
        const planKey = user?.subscription?.plan || "pro"
        const plan = pricingPlans.find(p => p.id === planKey)
        return plan?.price || (planKey === "pro" ? 49000 : 299000)
    }

    const planPrice = getPlanPrice()

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-TZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getPaymentMethodName = (method: string) => {
        const names: Record<string, string> = {
            mpesa: "M-Pesa (Vodacom)",
            tigopesa: "Tigo Pesa",
            airtelmoney: "Airtel Money",
            halopesa: "Halopesa",
            card: "Credit/Debit Card",
        }
        return names[method] || method
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="YIF Capital" width={40} height={40} className="h-10 w-10" />
                        <span className="text-xl font-bold text-white">YIF Capital</span>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-12">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
                    <p className="text-white/60 mt-2">
                        Thank you for subscribing to YIF Capital {transaction?.plan === "pro" ? "Pro" : "Institutional"}
                    </p>
                </div>

                {/* Receipt Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                    {/* Receipt Header */}
                    <div className="bg-gradient-to-r from-gold/20 to-gold/5 p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Receipt className="h-6 w-6 text-gold" />
                                <span className="font-semibold text-white">Payment Receipt</span>
                            </div>
                            <span className="text-sm text-white/60">
                                {transaction?.receiptNumber || "YIF-XXXX-XXXX"}
                            </span>
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-6 space-y-6">
                        {/* Plan Info */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                                <Crown className="h-6 w-6 text-gold" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">
                                    {(user?.subscription?.plan || transaction?.plan || "pro").toUpperCase()} Plan
                                </h3>
                                <p className="text-sm text-white/60">Monthly subscription</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gold">TZS {formatCurrency(transaction?.amount || planPrice)}</p>
                                <p className="text-sm text-white/60">/month</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/10">
                                <div className="flex items-center gap-3 text-white/60">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date & Time</span>
                                </div>
                                <span className="text-white">
                                    {transaction?.completedAt ? formatDate(transaction.completedAt) : "—"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-white/10">
                                <div className="flex items-center gap-3 text-white/60">
                                    {transaction?.method === "card" ? (
                                        <CreditCard className="h-4 w-4" />
                                    ) : (
                                        <Smartphone className="h-4 w-4" />
                                    )}
                                    <span>Payment Method</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-white">{getPaymentMethodName(transaction?.method || "")}</p>
                                    {transaction?.phone && (
                                        <p className="text-sm text-white/50">+255 {transaction.phone}</p>
                                    )}
                                    {transaction?.cardLast4 && (
                                        <p className="text-sm text-white/50">•••• {transaction.cardLast4}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-white/10">
                                <span className="text-white/60">Status</span>
                                <span className="flex items-center gap-2 text-green-500">
                                    <Check className="h-4 w-4" />
                                    Completed
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <span className="font-semibold text-white">Total Paid</span>
                                <span className="text-xl font-bold text-gold">
                                    TZS {formatCurrency(transaction?.amount || planPrice)}
                                </span>
                            </div>
                        </div>

                        {/* Subscription Info */}
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <p className="text-green-400 text-sm">
                                🎉 Your subscription is now active! You have full access to all{" "}
                                {transaction?.plan === "pro" ? "Pro" : "Institutional"} features until{" "}
                                {user?.subscription?.expiresAt
                                    ? new Date(user.subscription.expiresAt).toLocaleDateString("en-TZ", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "next month"}
                                .
                            </p>
                        </div>
                    </div>

                    {/* Receipt Footer */}
                    <div className="p-6 border-t border-white/10 bg-white/5">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                                onClick={() => window.print()}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: "YIF Capital Payment Receipt",
                                            text: `Payment of TZS ${formatCurrency(transaction?.amount || planPrice)} for ${user?.subscription?.plan || transaction?.plan || "pro"} plan`,
                                        })
                                    }
                                }}
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                    <Button asChild className="bg-gold hover:bg-gold/90 text-navy font-semibold px-8">
                        <Link href="/dashboard">
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-center text-sm text-white/40">
                    A confirmation email has been sent to your registered email address.
                    <br />
                    Need help?{" "}
                    <Link href="/contact" className="text-gold hover:underline">
                        Contact Support
                    </Link>
                </p>
            </main>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <SuccessContent />
    )
}
