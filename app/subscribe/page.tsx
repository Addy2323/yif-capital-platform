"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { getPricingPlans, type PricingPlan } from "@/lib/pricing-data"
import {
    MOBILE_MONEY_PROVIDERS,
    CARD_PROVIDER,
    processMobileMoneyPayment,
    processCardPayment,
    formatCurrency,
    type PaymentMethod,
} from "@/lib/payment-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    Check,
    Shield,
    Lock,
    CreditCard,
    Smartphone,
    Loader2,
    AlertCircle,
    Crown,
} from "lucide-react"

// Default features for each plan (used as fallback)
const DEFAULT_FEATURES = {
    pro: [
        "Real-time market prices",
        "Advanced interactive charts",
        "Technical indicators (50+)",
        "Stock screener",
        "Unlimited watchlists",
        "Portfolio tracking",
        "Price alerts & notifications",
        "All Academy courses",
        "Priority support",
    ],
    institutional: [
        "Everything in Pro",
        "REST API access",
        "Historical data downloads",
        "Custom data feeds",
        "Dedicated account manager",
        "SLA guarantees",
    ],
}

interface PlanDisplay {
    name: string
    price: number
    period: string
    features: string[]
}

function SubscribeContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, isLoading, updateUser, refreshSession } = useAuth()

    const planKey = (searchParams.get("plan") as "pro" | "institutional") || "pro"

    // State for dynamic pricing
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])

    // Load pricing from localStorage on mount
    useEffect(() => {
        setPricingPlans(getPricingPlans())
    }, [])

    // Get the current plan with dynamic pricing
    const getPlan = (): PlanDisplay => {
        const pricingPlan = pricingPlans.find(p => p.id === planKey)
        if (pricingPlan) {
            return {
                name: pricingPlan.name,
                price: pricingPlan.price,
                period: "month",
                features: pricingPlan.features
                    .filter(f => f.included)
                    .map(f => f.name)
            }
        }
        // Fallback to defaults if pricing not loaded yet
        return {
            name: planKey === "pro" ? "Pro" : "Institutional",
            price: planKey === "pro" ? 49000 : 299000,
            period: "month",
            features: DEFAULT_FEATURES[planKey] || DEFAULT_FEATURES.pro
        }
    }

    const plan = getPlan()

    const [step, setStep] = useState<"method" | "details" | "processing" | "success">("method")
    const [paymentType, setPaymentType] = useState<"mobile" | "card" | null>(null)
    const [selectedProvider, setSelectedProvider] = useState<PaymentMethod | null>(null)
    const [phone, setPhone] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [cardName, setCardName] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Only redirect after auth loading is complete and user is still null
        if (!isLoading && !user) {
            router.push("/login?redirect=/subscribe?plan=" + planKey)
        }
    }, [user, isLoading, router, planKey])

    const handlePayment = async () => {
        if (!user) return

        setError(null)
        setIsProcessing(true)
        setStep("processing")

        try {
            if (paymentType === "mobile" && selectedProvider) {
                await processMobileMoneyPayment(phone, plan.price, selectedProvider, planKey)
                // For mobile money, we stay in processing and could poll the session
                // For simulation, we'll just show success after a delay
                await new Promise(r => setTimeout(r, 5000));
                await refreshSession();
                setStep("success");
            } else if (paymentType === "card") {
                await processCardPayment(cardNumber.replace(/\s/g, ""), plan.price, planKey);
                await refreshSession();
                setStep("success");
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
            setStep("details")
        } finally {
            setIsProcessing(false)
        }
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ""
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        return parts.length ? parts.join(" ") : value
    }

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        if (v.length >= 2) {
            return v.substring(0, 2) + "/" + v.substring(2, 4)
        }
        return v
    }

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
        )
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
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Secure Payment</span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">
                {/* Back Button */}
                {step !== "success" && (
                    <Button
                        variant="ghost"
                        className="mb-6 text-white/60 hover:text-white"
                        onClick={() => {
                            if (step === "details") {
                                setStep("method")
                                setPaymentType(null)
                                setSelectedProvider(null)
                            } else {
                                router.back()
                            }
                        }}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                )}

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Payment Form */}
                    <div className="lg:col-span-3">
                        {step === "method" && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Choose Payment Method</h1>
                                    <p className="text-white/60 mt-1">Select how you'd like to pay for your subscription</p>
                                </div>

                                {/* Mobile Money */}
                                <div className="space-y-3">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Smartphone className="h-5 w-5 text-gold" />
                                        Mobile Money
                                    </h2>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {MOBILE_MONEY_PROVIDERS.map((provider) => (
                                            <button
                                                key={provider.id}
                                                onClick={() => {
                                                    setPaymentType("mobile")
                                                    setSelectedProvider(provider.id)
                                                    setStep("details")
                                                }}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/50 transition-all group"
                                            >
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                                                    style={{ backgroundColor: provider.color + "20" }}
                                                >
                                                    <Image
                                                        src={provider.icon}
                                                        alt={provider.displayName}
                                                        width={36}
                                                        height={36}
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-white group-hover:text-gold transition-colors">
                                                        {provider.displayName}
                                                    </p>
                                                    <p className="text-sm text-white/50">Pay with mobile wallet</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-slate-900 px-4 text-white/40">or pay with card</span>
                                    </div>
                                </div>

                                {/* Card Payment */}
                                <button
                                    onClick={() => {
                                        setPaymentType("card")
                                        setSelectedProvider("card")
                                        setStep("details")
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                                        <Image
                                            src="/logo payment/crdb.png"
                                            alt="Card Payment"
                                            width={36}
                                            height={36}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-medium text-white group-hover:text-gold transition-colors">
                                            Credit or Debit Card
                                        </p>
                                        <p className="text-sm text-white/50">Visa, Mastercard accepted</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600">
                                            VISA
                                        </div>
                                        <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                                            <div className="flex -space-x-1">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {step === "details" && paymentType === "mobile" && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Enter Phone Number</h1>
                                    <p className="text-white/60 mt-1">
                                        {MOBILE_MONEY_PROVIDERS.find((p) => p.id === selectedProvider)?.instructions}
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-white">
                                            Phone Number
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">+255</span>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="7XX XXX XXX"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                className="pl-16 h-14 bg-white/5 border-white/10 text-white text-lg placeholder:text-white/30"
                                            />
                                        </div>
                                        <p className="text-sm text-white/40">Enter your registered mobile money number</p>
                                    </div>

                                    <Button
                                        onClick={handlePayment}
                                        disabled={phone.length !== 9 || isProcessing}
                                        className="w-full h-14 bg-gold hover:bg-gold/90 text-navy font-semibold text-lg"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay TZS {formatCurrency(plan.price)}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === "details" && paymentType === "card" && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Card Details</h1>
                                    <p className="text-white/60 mt-1">Enter your card information securely</p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardName" className="text-white">
                                            Name on Card
                                        </Label>
                                        <Input
                                            id="cardName"
                                            placeholder="JOHN DOE"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber" className="text-white">
                                            Card Number
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                maxLength={19}
                                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-12"
                                            />
                                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardExpiry" className="text-white">
                                                Expiry Date
                                            </Label>
                                            <Input
                                                id="cardExpiry"
                                                placeholder="MM/YY"
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                maxLength={5}
                                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cardCvv" className="text-white">
                                                CVV
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="cardCvv"
                                                    type="password"
                                                    placeholder="•••"
                                                    value={cardCvv}
                                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                    maxLength={4}
                                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePayment}
                                        disabled={
                                            cardNumber.replace(/\s/g, "").length < 16 ||
                                            cardExpiry.length !== 5 ||
                                            cardCvv.length < 3 ||
                                            !cardName ||
                                            isProcessing
                                        }
                                        className="w-full h-14 bg-gold hover:bg-gold/90 text-navy font-semibold text-lg"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-5 w-5 mr-2" />
                                                Pay TZS {formatCurrency(plan.price)}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-4 text-white/40 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Lock className="h-4 w-4" />
                                        <span>256-bit SSL</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Shield className="h-4 w-4" />
                                        <span>PCI DSS Compliant</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === "processing" && (
                            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-gold/20 flex items-center justify-center">
                                        <Loader2 className="h-12 w-12 text-gold animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white">Processing Payment</h2>
                                    <p className="text-white/60 mt-2">
                                        {paymentType === "mobile"
                                            ? "Please check your phone and enter your PIN to confirm"
                                            : "Verifying your card details..."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="h-12 w-12 text-green-500" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                                    <p className="text-white/60 mt-2">
                                        Welcome to YIF Capital {plan.name}! Your subscription is now active.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        asChild
                                        className="bg-gold hover:bg-gold/90 text-navy font-semibold"
                                    >
                                        <Link href="/dashboard">Go to Dashboard</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/10"
                                    >
                                        <Link href="/subscribe/success">View Receipt</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                                    <Crown className="h-6 w-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{plan.name} Plan</h3>
                                    <p className="text-sm text-white/60">Monthly subscription</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                {plan.features.slice(0, 5).map((feature) => (
                                    <div key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-gold flex-shrink-0" />
                                        <span className="text-white/80">{feature}</span>
                                    </div>
                                ))}
                                {plan.features.length > 5 && (
                                    <p className="text-sm text-white/50">+{plan.features.length - 5} more features</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-2">
                                <div className="flex justify-between text-white/60">
                                    <span>Subtotal</span>
                                    <span>TZS {formatCurrency(plan.price)}</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Tax</span>
                                    <span>TZS 0</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-white/10">
                                    <span>Total</span>
                                    <span className="text-gold">TZS {formatCurrency(plan.price)}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-start gap-3 text-sm text-white/50">
                                    <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p>
                                        Your payment is secured with end-to-end encryption. You can cancel anytime from your
                                        account settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function SubscribePage() {
    return (
        <AuthProvider>
            <SubscribeContent />
        </AuthProvider>
    )
}
