"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Globe,
  MapPin,
  Users,
  Crown,
  Video,
  CheckCircle,
  Star,
  Smartphone,
  Building2,
  ShieldCheck,
} from "lucide-react"

const SESSION_TYPES = [
  { value: "ONLINE", label: "Online Meeting", icon: Video, description: "Video call via meet.yifcapital.co.tz", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { value: "PHYSICAL", label: "Physical Meeting", icon: MapPin, description: "Meet in person at expert's location", color: "text-green-500", bgColor: "bg-green-500/10" },
  { value: "GROUP", label: "Group Session", icon: Users, description: "Join a group learning session", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { value: "VIP_PRIVATE", label: "VIP Private", icon: Crown, description: "Exclusive 1-on-1 private consultation", color: "text-gold", bgColor: "bg-gold/10" },
]

const CATEGORY_LABELS: Record<string, string> = {
  STOCK_MARKET: "Stock Market", REAL_ESTATE: "Real Estate", BONDS_TREASURY: "Bonds & Treasury",
  SACCO_INVESTMENT: "SACCO Investment", FOREX_EDUCATION: "Forex Education", MUTUAL_FUNDS: "Mutual Funds",
  STARTUP_INVESTMENT: "Startup Investment", PERSONAL_FINANCE: "Personal Finance", SME_INVESTMENT: "SME Investment",
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
]

const STEPS = ["Category", "Session Type", "Date & Time", "Review & Pay"]

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
  availability: { dayOfWeek: number; startTime: string; endTime: string }[]
}

export default function BookExpertPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const expertId = params.expertId as string

  const [step, setStep] = useState(0)
  const [expert, setExpert] = useState<Expert | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [category, setCategory] = useState("")
  const [sessionType, setSessionType] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "BANK">("MOBILE_MONEY")
  const [mobileNumber, setMobileNumber] = useState("")
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetch(`/api/experts/${expertId}`)
      .then((res) => res.json())
      .then((data) => { if (!data.error) setExpert(data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [expertId, user, router])

  const calculatePrice = () => {
    if (!expert) return 0
    let price = expert.hourlyRate
    if (sessionType === "VIP_PRIVATE") price *= 2
    if (sessionType === "GROUP") price *= 0.5
    return price
  }

  const startPolling = (bId: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current)
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/lms/bookings/${bId}/status`)
        const data = await res.json()
        if (data.bookingStatus === "CONFIRMED") {
          if (pollInterval.current) clearInterval(pollInterval.current)
          toast.success("Payment confirmed! Redirecting to your bookings...")
          setStep(4)
          setIsSubmitting(false)
          // Small delay then redirect
          setTimeout(() => {
            router.push("/lms/bookings")
          }, 3000)
        } else if (data.bookingStatus === "CANCELLED" || data.paymentStatus === "failed") {
          if (pollInterval.current) clearInterval(pollInterval.current)
          toast.error("Payment failed or booking was cancelled.")
          setIsSubmitting(false)
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }, 3000)
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !sessionType || !category) return
    if (paymentMethod === "MOBILE_MONEY" && !mobileNumber.trim()) {
      toast.error("Please enter your mobile number to proceed with payment.")
      return
    }

    setIsSubmitting(true)
    try {
      const endHour = parseInt(selectedTime.split(":")[0]) + 1
      const endTime = `${endHour.toString().padStart(2, "0")}:00`

      // 1. Create PENDING booking
      const res = await fetch("/api/lms/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId,
          sessionType,
          category,
          topic: `${CATEGORY_LABELS[category]} Consultation`,
          scheduledDate: selectedDate.toISOString(),
          startTime: selectedTime,
          endTime,
          notes,
        }),
      })

      const booking = await res.json()
      if (!res.ok) {
        toast.error(booking.error || "Failed to create booking")
        setIsSubmitting(false)
        return
      }

      // 2. Initiate Real Snippe Payment
      const payRes = await fetch("/api/payments/initiate/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          phone: mobileNumber,
          amount: calculatePrice(),
        })
      })

      const payData = await payRes.json()
      if (payRes.ok) {
        toast.success("Payment initiated! Check your phone for the prompt.")
        startPolling(booking.id)
      } else {
        toast.error(payData.error || "Failed to initiate payment. Please try again.")
        setIsSubmitting(false)
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return !!category
      case 1: return !!sessionType
      case 2: return !!selectedDate && !!selectedTime
      case 3: return true
      default: return false
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

  if (!expert) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Expert Not Found</h2>
          <Button asChild className="mt-4 bg-gold text-navy hover:bg-gold/90">
            <a href="/experts">Browse Experts</a>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  // Success state
  if (step === 4) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="animate-check-bounce mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="mt-2 text-muted-foreground text-center max-w-md">
            Your session with {expert.user.name} has been booked. You'll receive a confirmation and meeting link shortly.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <a href="/lms/bookings">View My Bookings</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/experts">Browse More Experts</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          {/* Expert Mini Card */}
          <Card className="mb-8 border-gold/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-lg shrink-0 overflow-hidden">
                {expert.user.avatar ? (
                  <img src={expert.user.avatar} alt={expert.user.name} className="h-full w-full object-cover" />
                ) : (
                  expert.user.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{expert.user.name}</h3>
                <p className="text-sm text-muted-foreground">{expert.headline}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gold">
                  {expert.currency} {calculatePrice().toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">per session</div>
              </div>
            </CardContent>
          </Card>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    i < step ? "bg-gold text-navy" : i === step ? "bg-gold text-navy ring-4 ring-gold/20" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`hidden sm:block h-px w-8 lg:w-16 ${i < step ? "bg-gold" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[step]}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 0: Category */}
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {expert.specializations.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setCategory(spec)}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        category === spec
                          ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${category === spec ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"}`}>
                        <Star className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{CATEGORY_LABELS[spec] || spec}</span>
                      {category === spec && <Check className="ml-auto h-5 w-5 text-gold" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Session Type */}
              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {SESSION_TYPES.filter((st) => {
                    if (st.value === "PHYSICAL" && !expert.isAvailablePhysical) return false
                    if ((st.value === "ONLINE" || st.value === "GROUP" || st.value === "VIP_PRIVATE") && !expert.isAvailableOnline) return false
                    return true
                  }).map((st) => (
                    <button
                      key={st.value}
                      onClick={() => setSessionType(st.value)}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-5 text-left transition-all ${
                        sessionType === st.value
                          ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${st.bgColor} ${st.color}`}>
                        <st.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{st.label}</div>
                        <div className="text-xs text-muted-foreground">{st.description}</div>
                      </div>
                      {sessionType === st.value && <Check className="self-end text-gold h-5 w-5" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Select Date</h4>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-xl border"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Select Time</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                            selectedTime === time
                              ? "border-gold bg-gold text-navy"
                              : "border-border hover:border-gold/50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Additional Notes (Optional)</h4>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any specific topics you'd like to discuss..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Pay */}
              {step === 3 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left — Booking Summary */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Booking Summary</h4>
                    <div className="rounded-xl border border-border p-4 space-y-3 text-sm">
                      {[
                        { label: "Expert", value: expert.user.name },
                        { label: "Category", value: CATEGORY_LABELS[category] },
                        { label: "Session Type", value: SESSION_TYPES.find(s => s.value === sessionType)?.label },
                        { label: "Date", value: selectedDate?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) },
                        { label: "Time", value: `${selectedTime} – ${parseInt(selectedTime.split(":")[0]) + 1}:00` },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">{row.label}</span>
                          <span className="font-medium text-right">{row.value}</span>
                        </div>
                      ))}
                      {notes && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Notes</span>
                          <span className="font-medium text-right max-w-[60%]">{notes}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-xl text-gold">
                          {expert.currency} {calculatePrice().toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {(sessionType === "ONLINE" || sessionType === "VIP_PRIVATE" || sessionType === "GROUP") ? (
                      <div className="flex items-center gap-3 rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                        <Video className="h-4 w-4 text-blue-500 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Meeting link on <span className="font-medium text-foreground">meet.yifcapital.co.tz</span> generated after confirmation.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                        <MapPin className="h-4 w-4 text-green-500 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Location: <span className="font-medium text-foreground">{expert.physicalAddress || "To be confirmed"}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right — Payment */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Method</h4>

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
                        />
                        <p className="text-[11px] text-muted-foreground">
                          You will receive a push notification to approve payment.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "BANK" && (
                      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1.5 text-sm">
                        <p className="font-semibold">Bank Transfer Details</p>
                        <p className="text-muted-foreground">Bank: <span className="text-foreground font-medium">CRDB Bank Plc</span></p>
                        <p className="text-muted-foreground">Account: <span className="text-foreground font-mono">0150123456789</span></p>
                        <p className="text-muted-foreground">Name: <span className="text-foreground font-medium">YIF Capital Ltd</span></p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Use your name as the reference. Booking activates within 24 hours.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Secured by YIF Capital · 256-bit encryption
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-2 bg-gold text-navy hover:bg-gold/90"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-gold text-navy hover:bg-gold/90"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {isSubmitting ? "Processing…" : `Pay & Confirm — ${expert?.currency} ${calculatePrice().toLocaleString()}`}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
