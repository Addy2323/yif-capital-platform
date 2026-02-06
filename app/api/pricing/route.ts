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
        console.log("[PUT /api/pricing] Request received");
        console.log("[PUT /api/pricing] Prisma available models:", Object.keys(prisma).filter(k => k[0] !== '_'));

        // Check admin auth
        const cookieStore = await cookies()
        const userId = cookieStore.get("user_id")?.value

        if (!userId) {
            console.error("[PUT /api/pricing] Unauthorized: No user_id cookie found")
            return NextResponse.json({ error: "Unauthorized: No user session" }, { status: 401 })
        }

        console.log(`[PUT /api/pricing] Checking user ${userId}`);
        if (!prisma.user) {
            console.error("[PUT /api/pricing] CRITICAL: prisma.user is EQUAL TO", typeof prisma.user);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, name: true }
        })

        console.log(`[PUT /api/pricing] User lookup:`, user ? `${user.name} (${user.role})` : "Not found");

        if (!user || (user.role !== "ADMIN" && (user.role as string).toUpperCase() !== "ADMIN") && (user.role as string) !== "admin") {
            console.error(`[PUT /api/pricing] Forbidden: User ${userId} has role ${user?.role}`)
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
        }

        const body = await req.json()
        console.log(`[PUT /api/pricing] Body:`, JSON.stringify(body, null, 2));

        const { planId, ...updates } = body

        if (!planId) {
            console.error("[PUT /api/pricing] Missing planId");
            return NextResponse.json({ error: "planId is required" }, { status: 400 })
        }

        console.log(`[PUT /api/pricing] Updating plan ${planId} with:`, JSON.stringify(updates, null, 2));

        if (!prisma.pricingPlan) {
            console.error("[PUT /api/pricing] CRITICAL: prisma.pricingPlan is EQUAL TO", typeof prisma.pricingPlan);
        }

        // Check if plan exists
        const existing = await prisma.pricingPlan.findUnique({
            where: { planId }
        });

        if (!existing) {
            console.error(`[PUT /api/pricing] Plan not found: ${planId}`);
            return NextResponse.json({ error: `Plan ${planId} not found` }, { status: 404 });
        }

        const updated = await prisma.pricingPlan.update({
            where: { planId },
            data: updates
        })

        console.log(`[PUT /api/pricing] Success: Updated ${updated.planId}`);

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
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: "Failed to update pricing",
            details: errorMessage
        }, { status: 500 })
    }
}
