export interface PricingFeature {
  name: string
  included: boolean
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  period?: string
  description: string
  features: PricingFeature[]
  cta: string
  href: string
  popular: boolean
}

export const PRICING_KEY = "yif_pricing_plans"

export const initialPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "TZS",
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
    id: "pro",
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
    id: "institutional",
    name: "Institutional",
    price: 299000,
    currency: "TZS",
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

export function getPricingPlans(): PricingPlan[] {
  if (typeof window === "undefined") return initialPlans

  const stored = localStorage.getItem(PRICING_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialPlans
    }
  }
  return initialPlans
}

export function savePricingPlans(plans: PricingPlan[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PRICING_KEY, JSON.stringify(plans))
  }
}

export function updatePricingPlan(id: string, updates: Partial<PricingPlan>): boolean {
  if (typeof window === "undefined") return false
  try {
    const plans = getPricingPlans()
    const index = plans.findIndex(p => p.id === id)
    if (index === -1) return false
    plans[index] = { ...plans[index], ...updates }
    savePricingPlans(plans)
    return true
  } catch {
    return false
  }
}
