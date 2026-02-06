import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Initial pricing data for seeding
const initialPlans = [
    {
        planId: "free",
        name: "Free",
        price: 0,
        currency: "TZS",
        period: null,
        description: "Get started with basic market data and learning resources.",
        features: [
            { name: "Delayed market prices (15 min)", included: true },
            { name: "Basic market overview", included: true },
            { name: "Limited stock profiles", included: true },
            { name: "Basic educational content", included: true },
            { name: "1 watchlist (max 10 stocks)", included: true },
            { name: "Real-time data", included: false },
            { name: "Advanced charting", included: false },
            { name: "Stock screener", included: false },
            { name: "Portfolio tracking", included: false },
            { name: "API access", included: false },
        ],
        cta: "Get Started",
        href: "/register",
        popular: false,
    },
    {
        planId: "pro",
        name: "Pro",
        price: 49000,
        currency: "TZS",
        period: "/month",
        description: "Full access to analytics, tools, and premium features.",
        features: [
            { name: "Real-time market prices", included: true },
            { name: "Full market depth", included: true },
            { name: "Advanced interactive charts", included: true },
            { name: "Technical indicators (50+)", included: true },
            { name: "Stock screener", included: true },
            { name: "Unlimited watchlists", included: true },
            { name: "Portfolio tracking", included: true },
            { name: "Price alerts & notifications", included: true },
            { name: "All Academy courses", included: true },
            { name: "Priority support", included: true },
        ],
        cta: "Subscribe Now",
        href: "/subscribe?plan=pro",
        popular: true,
    },
    {
        planId: "institutional",
        name: "Institutional",
        price: 299000,
        currency: "TZS",
        period: null,
        description: "Enterprise solutions for financial institutions and professionals.",
        features: [
            { name: "Everything in Pro", included: true },
            { name: "REST API access", included: true },
            { name: "Historical data downloads", included: true },
            { name: "Custom data feeds", included: true },
            { name: "White-label options", included: true },
            { name: "Dedicated account manager", included: true },
            { name: "SLA guarantees", included: true },
            { name: "Compliance reports", included: true },
            { name: "Custom integrations", included: true },
            { name: "On-premise deployment", included: true },
        ],
        cta: "Contact Sales",
        href: "/contact",
        popular: false,
    },
]

// GET: Fetch all pricing plans (public)
export async function GET() {
    try {
        let plans = await prisma.pricingPlan.findMany({
            orderBy: { price: "asc" }
        })

        // If no plans in DB, seed them
        if (plans.length === 0) {
            await Promise.all(
                initialPlans.map(plan =>
                    prisma.pricingPlan.create({ data: plan })
                )
            )
            plans = await prisma.pricingPlan.findMany({
                orderBy: { price: "asc" }
            })
        }

        // Transform to match frontend format
        const formattedPlans = plans.map((plan: { planId: string; name: string; price: number; currency: string; period: string | null; description: string; features: unknown; cta: string; href: string; popular: boolean }) => ({
            id: plan.planId,
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            period: plan.period,
            description: plan.description,
            features: plan.features as { name: string; included: boolean }[],
            cta: plan.cta,
            href: plan.href,
            popular: plan.popular,
        }))

        return NextResponse.json(formattedPlans)
    } catch (error) {
        console.error("Get Pricing Error:", error)
        return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
    }
}

// PUT: Update a pricing plan (admin only)
export async function PUT(req: NextRequest) {
    try {
        // Check admin auth
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get("session")

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const session = JSON.parse(sessionCookie.value)
        if (session.role !== "ADMIN" && session.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { planId, ...updates } = body

        if (!planId) {
            return NextResponse.json({ error: "planId is required" }, { status: 400 })
        }

        const updated = await prisma.pricingPlan.update({
            where: { planId },
            data: updates
        })

        return NextResponse.json({
            id: updated.planId,
            name: updated.name,
            price: updated.price,
            currency: updated.currency,
            period: updated.period,
            description: updated.description,
            features: updated.features,
            cta: updated.cta,
            href: updated.href,
            popular: updated.popular,
        })
    } catch (error) {
        console.error("Update Pricing Error:", error)
        return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 })
    }
}
