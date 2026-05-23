"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    ArrowRight,
    ArrowLeft,
    Check,
    Smartphone,
    Shield,
    CheckCircle,
    Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const TIME_SLOTS = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
]

const CATEGORY_LABELS: Record<string, string> = {
    STOCK_MARKET: "Stock Market",
    REAL_ESTATE: "Real Estate",
    BONDS_TREASURY: "Bonds & Treasury",
    SACCO_INVESTMENT: "SACCO Investment",
    FOREX_EDUCATION: "Forex Education",
    MUTUAL_FUNDS: "Mutual Funds",
    STARTUP_INVESTMENT: "Startup Investment",
    PERSONAL_FINANCE: "Personal Finance",
    SME_INVESTMENT: "SME Investment",
}

function formatCategory(cat: string) {
    return CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

interface Expert {
    id: string
    headline: string | null
    hourlyRate: number
    currency: string
    specializations: string[]
    isAvailableOnline: boolean
    isAvailablePhysical: boolean
    physicalAddress: string | null
    user: { name: string; avatar: string | null }
}

export default function BookingStepper() {
    const params = useParams()
    const router = useRouter()
    const expertId = params?.expertId as string

    const [expert, setExpert] = useState<Expert | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [step, setStep] = useState(1)
    const [selectedTopic, setSelectedTopic] = useState("")
    const [selectedSessionType, setSelectedSessionType] = useState<"ONLINE" | "PHYSICAL">("ONLINE")
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
    const [goalsInput, setGoalsInput] = useState("")
    const [notesInput, setNotesInput] = useState("")
    const [paymentProvider, setPaymentProvider] = useState<"M_PESA" | "TIGO_PESA" | "AIRTEL_MONEY" | "CARD">("M_PESA")
    const [paymentPhone, setPaymentPhone] = useState("")
    const [cardName, setCardName] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [bookingRef, setBookingRef] = useState("")

    useEffect(() => {
        fetch(`/api/experts/${expertId}`)
            .then(r => r.json())
            .then(data => {
                if (!data.error) {
                    setExpert(data)
                    if (data.specializations?.[0]) setSelectedTopic(data.specializations[0])
                }
                setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
    }, [expertId])

    const handleNextStep = () => {
        if (step === 1 && !selectedTopic) { toast.error("Please select an advisory topic."); return }
        if (step === 2 && (!selectedDate || !selectedTimeSlot)) { toast.error("Please select a date and time slot."); return }
        if (step === 3 && !goalsInput.trim()) { toast.error("Please share your primary investment goals."); return }
        setStep(s => s + 1)
    }

    const handleConfirmPayment = async () => {
        if (!expert) return
        if (!paymentPhone.trim()) { toast.error("Please enter your mobile money phone number."); return }

        setIsProcessing(true)
        try {
            const endHour = parseInt(selectedTimeSlot.split(":")[0]) + 1
            const endTime = `${endHour.toString().padStart(2, "0")}:00`

            // 1. Create the booking (status PENDING)
            const res = await fetch("/api/lms/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    expertId,
                    sessionType: selectedSessionType,
                    category: selectedTopic,
                    topic: `${formatCategory(selectedTopic)} Consultation`,
                    scheduledDate: new Date(selectedDate).toISOString(),
                    startTime: selectedTimeSlot,
                    endTime,
                    notes: [goalsInput, notesInput].filter(Boolean).join("\n"),
                }),
            })

            const booking = await res.json()
            if (!res.ok) { toast.error(booking.error || "Failed to create booking"); return }

            // 2. Initiate Payment via Snippe
            const payRes = await fetch("/api/payments/initiate/booking", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: booking.id,
                phone: paymentPhone,
                amount: expert.hourlyRate, // and handle different rates eventually
              })
            })

            const payData = await payRes.json()
            if (payRes.ok) {
              const ref = booking.id?.slice(0, 8).toUpperCase() ?? `YIF-BK-${Math.floor(10000 + Math.random() * 90000)}`
              setBookingRef(`YIF-BK-${ref}`)
              setStep(5)
              toast.success("Booking created! Check your phone for the payment prompt.")
            } else {
              toast.error(payData.error || "Failed to initiate payment. Please try again.")
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        )
    }

    if (!expert) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
                <h2 className="text-xl font-semibold">Expert Not Found</h2>
                <Button onClick={() => router.push("/experts")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Browse Experts
                </Button>
            </div>
        )
    }

    const minDate = new Date().toISOString().split("T")[0]

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex justify-center items-start pt-16 md:pt-24">
            <div className="w-full max-w-4xl space-y-8">
                {/* Stepper Header */}
                <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                                {step < 5 ? step : <CheckCircle className="h-5 w-5" />}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Book Advisory Session</h1>
                                <p className="text-xs text-white/50">Expert: {expert.user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <div
                                    key={s}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        step === s ? "w-8 bg-emerald-500" : s < step ? "w-2 bg-emerald-500/50" : "w-2 bg-white/10"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* STEP 1: Topic & Session Style */}
                        {step === 1 && (
                            <Card className="bg-slate-800/40 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Step 1: Focus Area & Session Style</CardTitle>
                                    <CardDescription className="text-white/60">Choose your advisory topic and preferred meeting type.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/70 block">Select Specialization Focus</label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {expert.specializations.map(spec => (
                                                <div
                                                    key={spec}
                                                    onClick={() => setSelectedTopic(spec)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 bg-slate-900/40 hover:border-emerald-500/30 ${
                                                        selectedTopic === spec ? "border-emerald-500 bg-emerald-500/5" : "border-white/5"
                                                    }`}
                                                >
                                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                                                        selectedTopic === spec ? "border-emerald-500 bg-emerald-500" : "border-white/20"
                                                    }`}>
                                                        {selectedTopic === spec && <Check className="h-2.5 w-2.5 text-slate-900 stroke-[3]" />}
                                                    </div>
                                                    <span className="text-sm font-semibold">{formatCategory(spec)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t border-white/5 pt-6">
                                        <label className="text-xs font-bold text-white/70 block">Session Type</label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {expert.isAvailableOnline && (
                                                <div
                                                    onClick={() => setSelectedSessionType("ONLINE")}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 bg-slate-900/40 hover:border-emerald-500/30 ${
                                                        selectedSessionType === "ONLINE" ? "border-emerald-500 bg-emerald-500/5" : "border-white/5"
                                                    }`}
                                                >
                                                    <Video className="h-5 w-5 text-blue-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-sm font-semibold block">Online Video Conference</span>
                                                        <span className="text-xs text-white/40 mt-1 block">Live video stream at meet.yifcapital.co.tz</span>
                                                    </div>
                                                </div>
                                            )}
                                            {expert.isAvailablePhysical && (
                                                <div
                                                    onClick={() => setSelectedSessionType("PHYSICAL")}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 bg-slate-900/40 hover:border-emerald-500/30 ${
                                                        selectedSessionType === "PHYSICAL" ? "border-emerald-500 bg-emerald-500/5" : "border-white/5"
                                                    }`}
                                                >
                                                    <MapPin className="h-5 w-5 text-amber-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-sm font-semibold block">Physical Meeting</span>
                                                        <span className="text-xs text-white/40 mt-1 block">{expert.physicalAddress || "At expert's office location"}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 2: Date & Time */}
                        {step === 2 && (
                            <Card className="bg-slate-800/40 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Step 2: Date & Time Slot</CardTitle>
                                    <CardDescription className="text-white/60">Pick a date and preferred hourly slot.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/70 block">Select Date</label>
                                        <input
                                            type="date"
                                            min={minDate}
                                            value={selectedDate}
                                            onChange={e => { setSelectedDate(e.target.value); setSelectedTimeSlot("") }}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {selectedDate && (
                                        <div className="space-y-2 border-t border-white/5 pt-4">
                                            <label className="text-xs font-bold text-white/70 block">Available Time Slots</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {TIME_SLOTS.map(slot => (
                                                    <div
                                                        key={slot}
                                                        onClick={() => setSelectedTimeSlot(slot)}
                                                        className={`p-2.5 rounded-lg border text-center text-xs font-mono cursor-pointer transition-all bg-slate-900/40 hover:border-emerald-500/30 ${
                                                            selectedTimeSlot === slot
                                                                ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold"
                                                                : "border-white/5 text-white/70"
                                                        }`}
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 3: Goals */}
                        {step === 3 && (
                            <Card className="bg-slate-800/40 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Step 3: Consultation Questionnaire</CardTitle>
                                    <CardDescription className="text-white/60">Help the expert prepare for your session.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/70">Primary Investment Goals & Concerns *</label>
                                        <textarea
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500"
                                            placeholder="e.g. I want to build a balanced treasury bonds structure for secondary market trading..."
                                            rows={4}
                                            value={goalsInput}
                                            onChange={e => setGoalsInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/70">Additional Notes (Optional)</label>
                                        <textarea
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500"
                                            placeholder="e.g. Mention any current investment portfolios or timeline preference."
                                            rows={2}
                                            value={notesInput}
                                            onChange={e => setNotesInput(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 4: Payment */}
                        {step === 4 && (
                            <Card className="bg-slate-800/40 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Step 4: Secure Checkout</CardTitle>
                                    <CardDescription className="text-white/60">Select your payment channel. Supports all Tanzanian mobile money carriers.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/70 block">Select Provider</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {[
                                                { id: "M_PESA", name: "M-Pesa", color: "bg-red-600/10 text-red-500 border-red-500/20" },
                                                { id: "TIGO_PESA", name: "Tigo Pesa", color: "bg-blue-600/10 text-blue-500 border-blue-500/20" },
                                                { id: "AIRTEL_MONEY", name: "Airtel Money", color: "bg-rose-600/10 text-rose-500 border-rose-500/20" },
                                                { id: "CARD", name: "Visa/Mastercard", color: "bg-slate-700/20 text-white border-white/15" },
                                            ].map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setPaymentProvider(p.id as any)}
                                                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${p.color} ${
                                                        paymentProvider === p.id ? "border-emerald-500 ring-1 ring-emerald-500" : "opacity-60"
                                                    }`}
                                                >
                                                    <span className="text-[11px] font-bold block">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {paymentProvider !== "CARD" ? (
                                        <div className="space-y-1 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                                            <label className="text-xs font-semibold text-white/70 block">Mobile Wallet Phone Number</label>
                                            <div className="relative mt-1">
                                                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                                                    placeholder="+255 712 345 678"
                                                    value={paymentPhone}
                                                    onChange={e => setPaymentPhone(e.target.value)}
                                                />
                                            </div>
                                            <span className="text-[10px] text-white/40 block pt-1">
                                                A USSD push notification will be sent to this number to authorize the transaction.
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-white/70">Cardholder Name</label>
                                                <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" value={cardName} onChange={e => setCardName(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-white/70">Card Number</label>
                                                <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500" placeholder="4000 1234 5678 9010" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-white/70 leading-relaxed">
                                            Funds are held securely by YIF Capital. Payment is only settled after the consultation has concluded successfully.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 5: Confirmation */}
                        {step === 5 && (
                            <Card className="bg-slate-800/40 border-emerald-500/30 text-white text-center p-8 space-y-6">
                                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <CheckCircle className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                                    <p className="text-white/60 text-sm max-w-md mx-auto">
                                        Your consultation has been scheduled with {expert.user.name}.
                                    </p>
                                </div>
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                                        <span className="text-white/40">Reference Code</span>
                                        <span className="font-mono font-bold text-white">{bookingRef}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-white/40 block text-xs">Topic</span>
                                            <span className="font-semibold">{formatCategory(selectedTopic)}</span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block text-xs">Type</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                                                {selectedSessionType === "ONLINE" ? "Online" : "Physical"}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block text-xs">Date</span>
                                            <span className="font-semibold">{selectedDate}</span>
                                        </div>
                                        <div>
                                            <span className="text-white/40 block text-xs">Time</span>
                                            <span className="font-semibold font-mono">{selectedTimeSlot}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                    <Button onClick={() => router.push("/lms/bookings")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        View in Bookings
                                    </Button>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent" onClick={() => router.push("/experts")}>
                                        Browse More Experts
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Navigation */}
                        {step < 5 && (
                            <div className="flex justify-between items-center pt-2">
                                <Button onClick={() => setStep(s => s - 1)} disabled={step === 1} variant="ghost" className="text-white/60 hover:text-white disabled:opacity-30">
                                    <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                                </Button>
                                {step < 4 ? (
                                    <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Continue <ArrowRight className="h-4 w-4 ml-1.5" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleConfirmPayment} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                                        {isProcessing ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Verifying...</> : <>Authorize Pay <Check className="h-4 w-4 ml-1.5" /></>}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Summary Card */}
                    <div>
                        <Card className="bg-slate-800/40 border-white/10 text-white sticky top-24">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-sm uppercase tracking-wider font-bold text-white/50">Advisory Quote</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex gap-3 items-center">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                        {expert.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">{expert.user.name}</h4>
                                        <span className="text-[11px] text-white/40 block">{expert.headline || "Financial Advisor"}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs border-t border-white/5 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Session Rate (1 Hour)</span>
                                        <span className="font-semibold tabular-nums">{expert.hourlyRate.toLocaleString()} {expert.currency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Tax & Regulatory Levy</span>
                                        <span className="font-semibold text-emerald-400">0 TZS (Waived)</span>
                                    </div>
                                    <div className="flex justify-between border-t border-white/5 pt-3 text-sm">
                                        <span className="font-bold">Total Quote</span>
                                        <span className="font-bold text-emerald-400 tabular-nums">{expert.hourlyRate.toLocaleString()} {expert.currency}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs pt-4 border-t border-white/5 text-white/60">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${selectedTopic ? "bg-emerald-400" : "bg-white/10"}`} />
                                        <span>Focus: <strong>{selectedTopic ? formatCategory(selectedTopic) : "Pending"}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        <span>Type: <strong>{selectedSessionType === "ONLINE" ? "Online" : "Physical"}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${selectedTimeSlot ? "bg-emerald-400" : "bg-white/10"}`} />
                                        <span>Schedule: <strong>{selectedTimeSlot ? `${selectedDate} @ ${selectedTimeSlot}` : "Pending"}</strong></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
