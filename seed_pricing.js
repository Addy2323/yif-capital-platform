
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
];

async function main() {
    try {
        const count = await prisma.pricingPlan.count();
        if (count === 0) {
            console.log('Seeding initial plans...');
            await Promise.all(
                initialPlans.map(plan =>
                    prisma.pricingPlan.create({ data: plan })
                )
            );
            console.log('Seeding successful.');
        } else {
            console.log('Plans already exist.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
