import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { getPricingPlans, PricingPlan } from "@/lib/pricing-data"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[]>([])

  useEffect(() => {
    setPlans(getPricingPlans())
  }, [])

  if (plans.length === 0) return null
  return (
    <section className="py-20 lg:py-28 bg-background" id="pricing">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <ScrollAnimation animation="slide-up" className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Choose the plan that fits your investment needs. All plans include core platform access.
          </p>
        </ScrollAnimation>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <ScrollAnimation
              key={plan.name}
              animation="slide-up"
              delay={index * 100}
              className={`relative rounded-2xl border p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular
                ? "border-gold bg-navy text-white shadow-xl"
                : "border-border bg-card"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gold px-4 py-1 text-sm font-semibold text-navy">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className={`text-xl font-semibold ${plan.popular ? "text-white" : "text-card-foreground"}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  {plan.price > 0 && (
                    <span className={`text-sm ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>
                      {plan.currency}
                    </span>
                  )}
                  <span className={`text-4xl font-bold ${plan.popular ? "text-gold" : "text-foreground"}`}>
                    {plan.price === 0 ? "Free" :
                      plan.id === "institutional" && plan.price === 299000 ? "Custom" :
                        plan.price.toLocaleString()}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mt-4 text-sm ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`h-5 w-5 flex-shrink-0 ${plan.popular ? "text-gold" : "text-gold"}`} />
                    ) : (
                      <X className={`h-5 w-5 flex-shrink-0 ${plan.popular ? "text-white/30" : "text-muted-foreground/50"}`} />
                    )}
                    <span
                      className={`text-sm ${feature.included
                        ? plan.popular
                          ? "text-white"
                          : "text-card-foreground"
                        : plan.popular
                          ? "text-white/40"
                          : "text-muted-foreground/60"
                        }`}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-8 w-full ${plan.popular
                  ? "bg-gold text-navy hover:bg-gold/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  )
}
