import { Star } from "lucide-react"

const testimonials = [
  {
    content:
      "YIF Capital has transformed how I analyze the DSE. The real-time data and charting tools are on par with international platforms.",
    author: "James Mwanga",
    role: "Portfolio Manager",
    company: "Dar Investments Ltd",
    rating: 5,
  },
  {
    content:
      "The Academy courses helped me go from knowing nothing about stocks to confidently managing my own portfolio. Highly recommended!",
    author: "Grace Kimaro",
    role: "Retail Investor",
    company: "Self-employed",
    rating: 5,
  },
  {
    content:
      "As an institutional user, the API access and data quality are exactly what we need. The YIF team has been incredibly responsive.",
    author: "Dr. Michael Njau",
    role: "Head of Research",
    company: "Tanzania Securities",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Trusted by Investors Across Tanzania
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            See what our users say about their experience with YIF Capital.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-6 text-card-foreground leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-lg font-semibold text-gold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "10,000+", label: "Active Users" },
            { value: "28", label: "Listed Securities" },
            { value: "99.9%", label: "Platform Uptime" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-gold">{stat.value}</p>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
