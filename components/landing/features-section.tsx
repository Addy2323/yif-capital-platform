import {
  BarChart3,
  LineChart,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Zap,
  Users,
  FileText,
  PieChart,
  TrendingUp,
  BookOpen,
} from "lucide-react"

const features = [
  {
    name: "Real-time Market Data",
    description: "Live DSE prices with low latency feeds and comprehensive market depth.",
    icon: BarChart3,
  },
  {
    name: "Advanced Charting",
    description: "Professional charting tools with multiple timeframes and technical indicators.",
    icon: LineChart,
  },
  {
    name: "Smart Alerts",
    description: "Custom price alerts, volume spikes, and corporate action notifications.",
    icon: Bell,
  },
  {
    name: "Bank-grade Security",
    description: "Enterprise security with 2FA, encryption, and regulatory compliance.",
    icon: Shield,
  },
  {
    name: "Mobile-first Design",
    description: "Responsive platform that works seamlessly on any device.",
    icon: Smartphone,
  },
  {
    name: "Regional Coverage",
    description: "Data and insights for Tanzanian and East African markets.",
    icon: Globe,
  },
  {
    name: "Fast Performance",
    description: "Optimized platform with instant loading and real-time updates.",
    icon: Zap,
  },
  {
    name: "Community & Support",
    description: "Active investor community and dedicated customer support.",
    icon: Users,
  },
  {
    name: "Research Reports",
    description: "In-depth company analysis and market research from experts.",
    icon: FileText,
  },
  {
    name: "Portfolio Analytics",
    description: "Comprehensive portfolio tracking with performance metrics.",
    icon: PieChart,
  },
  {
    name: "Stock Screener",
    description: "Powerful screening tools to find investment opportunities.",
    icon: TrendingUp,
  },
  {
    name: "Learning Resources",
    description: "Educational content from basics to advanced strategies.",
    icon: BookOpen,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything You Need to Invest Smarter
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Built with institutional-grade tools and designed for investors of all experience levels.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-card-foreground">{feature.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
