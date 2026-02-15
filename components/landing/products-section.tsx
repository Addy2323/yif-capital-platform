import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, GraduationCap, Briefcase, ArrowRight, Check, MessagesSquare } from "lucide-react"

const products = [
  {
    name: "YIF ANALYTICS",
    description: "Advanced tools and market insights for informed investment decisions. Access technical charts and market movers.",
    icon: BarChart3,
    href: "/analytics",
    label: "Coming Soon",
    comingSoon: true,
  },
  {
    name: "YIF LMS",
    description: "Comprehensive investment education, from basics to advanced strategies. 82+ lessons and certificates.",
    icon: GraduationCap,
    href: "/academy",
    label: "Explore Courses",
  },
  {
    name: "YIF FORUM",
    description: "Join the community, discuss market trends, and connect with other investors. Share knowledge and grow together.",
    icon: MessagesSquare,
    href: "https://forum.yifcapital.co.tz",
    label: "Join Community",
  },
]

export function ProductsSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Our Products
          </h2>
        </div>

        {/* Products Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.name}
              className="flex flex-col items-center text-center rounded-2xl border border-border bg-white p-10 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/40 text-gold mb-6">
                <product.icon className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-bold text-navy mb-3">{product.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
                {product.description}
              </p>

              <Button
                asChild={!product.comingSoon}
                disabled={product.comingSoon}
                className={`w-full font-semibold ${product.comingSoon
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gold text-navy hover:bg-gold/90"
                  }`}
              >
                {product.comingSoon ? (
                  <span>{product.label}</span>
                ) : (
                  <Link href={product.href}>
                    {product.label}
                  </Link>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
