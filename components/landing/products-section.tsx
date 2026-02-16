"use client"

import Link from "next/link"
import { BarChart3, GraduationCap, MessagesSquare, ChevronRight } from "lucide-react"

const products = [
  {
    name: "YIF LMS",
    description:
      "Learn to invest with confidence through expert-led courses",
    icon: GraduationCap,
    href: "/academy",
    label: "Explore Courses",
  },
  {
    name: "YIF Forum",
    description:
      "Join the community to discuss and share investment ideas",
    icon: MessagesSquare,
    href: "https://forum.yifcapital.co.tz",
    label: "Join Community",
  },
  {
    name: "YIF Analytics",
    description:
      "Analyze the markets with advanced tools and insights",
    icon: BarChart3,
    href: "/",
    label: "Learn More",
  },
]

export function ProductsSection() {
  return (
    <section
      id="products"
      className="py-6 sm:py-2 lg:py-3 pb-24 sm:pb-4 lg:pb-4 bg-transparent sm:bg-white flex flex-col justify-start min-h-0 sm:rounded-b-[2rem] z-10 relative sm:shadow-lg start-0"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 w-full h-full flex flex-col justify-start pt-4 sm:pt-1 lg:pt-2">
        {/* Header */}
        <div className="text-left sm:text-center mb-6 sm:mb-3">
          <h2 className="text-xl sm:text-base font-bold tracking-tight text-white sm:text-navy sm:text-lg">
            <span className="sm:hidden block text-2xl mb-1">Explore YIF Capital</span>
            <span className="sm:hidden block text-2xl">Products</span>
            <span className="hidden sm:inline">Our Products</span>
          </h2>
        </div>

        {/* Products Grid / List */}
        <div className="flex flex-col gap-4 sm:grid sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              className="group relative flex items-center bg-white sm:flex-col sm:items-center sm:text-center rounded-xl sm:rounded-lg border-0 sm:border border-gray-100 p-4 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 w-full active:scale-[0.98]"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-full bg-gold/15 text-gold mr-4 sm:mr-0 sm:mb-1.5">
                <product.icon className="h-6 w-6 sm:h-4.5 sm:w-4.5" />
              </div>

              {/* Content */}
              <div className="flex-1 text-left sm:text-center">
                <h3 className="text-base sm:text-[10px] sm:text-xs font-bold text-navy mb-1 sm:mb-0.5 tracking-tight group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm sm:text-[10px] text-gray-500 leading-snug sm:mb-1.5 sm:h-7 sm:h-8 sm:overflow-hidden sm:line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* CTA Button / Chevron */}
              <div className="ml-2 sm:ml-0 sm:w-full flex-shrink-0">
                <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center sm:hidden">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div
                  className="hidden sm:inline-flex items-center justify-center h-6 sm:h-7 px-2.5 sm:px-3 w-auto sm:w-full rounded bg-navy text-white text-[9px] sm:text-[10px] font-semibold hover:bg-navy/90 transition-all duration-200"
                >
                  <span className="hidden sm:inline">{product.label}</span>
                  <span className="sm:hidden text-[9px]">{product.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
