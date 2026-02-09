import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, GraduationCap, Briefcase, ArrowRight, Check } from "lucide-react"

const products = [
  /* {
      name: "YIF Analytics",
      description: "Professional-grade market data, research, and analytics for traders and institutions.",
      icon: BarChart3,
      href: "/analytics",
      features: [
        "Real-time DSE prices",
        "Interactive charting",
        "Stock screener",
        "Technical indicators",
        "Market heatmaps",
      ],
      color: "bg-gold/10 text-gold",
    }, */
  {
    name: "YIF Academy",
    description: "Comprehensive investment education from basics to advanced portfolio management.",
    icon: GraduationCap,
    href: "/academy",
    features: [
      "Structured courses",
      "Video lessons",
      "Quizzes & certificates",
      "Community forums",
      "Expert mentorship",
    ],
    color: "bg-navy/10 text-navy",
  },
  /* {
      name: "YIF Investment Pro",
      description: "Advanced portfolio tracking, advisory tools, and personalized investment insights.",
      icon: Briefcase,
      href: "/investment-pro",
      features: [
        "Portfolio tracking",
        "Performance analytics",
        "Dividend calendar",
        "Price alerts",
        "Personalized insights",
      ],
      color: "bg-silver/30 text-charcoal",
    }, */
]

export function ProductsSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            One Platform, Three Powerful Products
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Everything you need to analyze markets, learn investing, and manage your portfolio in one unified ecosystem.
          </p>
        </div>

        {/* Products Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.name}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-gold/50 hover:shadow-lg"
            >
              <div className={`inline-flex rounded-xl p-3 ${product.color}`}>
                <product.icon className="h-6 w-6" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-card-foreground">{product.name}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{product.description}</p>

              <ul className="mt-6 space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-gold flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant="ghost"
                className="mt-8 w-full justify-between hover:bg-gold/10 hover:text-gold"
              >
                <Link href={product.href}>
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
