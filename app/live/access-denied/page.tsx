"use client"

import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ShieldAlert,
    Lock,
    Clock,
    Smartphone,
    ArrowRight,
    Crown,
    HelpCircle
} from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
    const searchParams = useSearchParams()
    const reason = searchParams.get("reason") || "unauthorized"
    const sessionId = searchParams.get("sessionId")

    const getReasonConfig = () => {
        switch (reason) {
            case "enrollment_missing":
                return {
                    icon: <Lock className="h-12 w-12 text-gold" />,
                    title: "Session Locked",
                    message: "This live class is reserved for Pro and Institutional members. No free seats are available today.",
                    cta: "Unlock Access Now",
                    href: "/pricing",
                    variant: "gold"
                }
            case "expired":
                return {
                    icon: <Clock className="h-12 w-12 text-muted-foreground" />,
                    title: "Link Expired",
                    message: "Your single-use access link has expired. For security reasons, links only last for one session.",
                    cta: "Refresh Link",
                    href: "/dashboard",
                    variant: "outline"
                }
            case "used":
                return {
                    icon: <ShieldAlert className="h-12 w-12 text-error" />,
                    title: "Link Already Used",
                    message: "This link was already used to join the session. For your protection, links cannot be shared or reused.",
                    cta: "Return to Dashboard",
                    href: "/dashboard",
                    variant: "outline"
                }
            case "wrong_device":
                return {
                    icon: <Smartphone className="h-12 w-12 text-gold" />,
                    title: "Security: Device Mismatch",
                    message: "You are trying to join from a different device. Our security protocol binds links to the original requesting device.",
                    cta: "Join on Original Device",
                    href: "/dashboard",
                    variant: "outline"
                }
            case "outside_window":
                return {
                    icon: <Clock className="h-12 w-12 text-gold" />,
                    title: "Lobby Not Open Yet",
                    message: "The live room opens exactly 30 minutes before the scheduled start time. Please wait a moment.",
                    cta: "Back to Dashboard",
                    href: "/dashboard",
                    variant: "outline"
                }
            default:
                return {
                    icon: <ShieldAlert className="h-12 w-12 text-error" />,
                    title: "Access Denied",
                    message: "We couldn't verify your access to this session. Please contact support if you believe this is an error.",
                    cta: "Upgrade to Pro",
                    href: "/pricing",
                    variant: "gold"
                }
        }
    }

    const config = getReasonConfig()

    return (
        <div className="flex min-h-screen flex-col bg-navy text-white">
            <Header />
            <main className="flex flex-1 items-center justify-center px-4 py-20">
                <div className="mx-auto max-w-lg text-center">
                    <div className="mb-6 flex justify-center">
                        <div className={`rounded-full p-4 bg-white/5 border border-white/10`}>
                            {config.icon}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {config.title}
                    </h1>

                    <p className="mt-4 text-lg text-white/60">
                        {config.message}
                    </p>

                    <div className="mt-10 flex flex-col gap-4">
                        {config.variant === "gold" ? (
                            <Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-bold h-14" asChild>
                                <Link href={config.href}>
                                    <Crown className="mr-2 h-5 w-5" />
                                    {config.cta}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14" asChild>
                                <Link href={config.href}>
                                    {config.cta}
                                </Link>
                            </Button>
                        )}

                        <Button variant="ghost" className="text-white/40 hover:text-white" asChild>
                            <Link href="/contact">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Need help accessing your session?
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-4 text-left">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Security Rule</h4>
                                <p className="text-[10px] text-white/40">Links are bound to one per device to prevent sharing.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Single Use</h4>
                                <p className="text-[10px] text-white/40">Once a session ends, the link expires immediately.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
