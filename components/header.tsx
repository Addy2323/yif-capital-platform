"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, BarChart2, GraduationCap, MessageSquare, Menu } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const navLinks = [
  { name: "Home", href: "/" },
  {
    name: "Products",
    href: "/#products",
    hasDropdown: true,
    dropdownItems: [
      {
        name: "YIF Analytics (Coming Soon)",
        description: "Market data & analysis",
        href: "/",
        icon: BarChart2
      },
      {
        name: "YIF Academy",
        description: "Investment education",
        href: "/academy",
        icon: GraduationCap
      },
      {
        name: "YIF Forum",
        description: "Community & discussion",
        href: "https://forum.yifcapital.co.tz",
        icon: MessageSquare
      },
    ]
  },
  { name: "Contact", href: "/contact" },
]

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-navy sticky top-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="YIF Capital"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              YIF Capital
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/" && pathname === "/")

              if (link.hasDropdown) {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setIsProductsOpen(true)}
                    onMouseLeave={() => setIsProductsOpen(false)}
                  >
                    <button
                      className={cn(
                        "text-sm font-medium transition-colors flex items-center gap-1.5 py-2",
                        isActive || isProductsOpen
                          ? "text-gold"
                          : "text-white/80 hover:text-white"
                      )}
                    >
                      {link.name}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isProductsOpen ? "rotate-180" : "")} />
                    </button>

                    {/* Dropdown Menu */}
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[300px] transition-all duration-200 ease-in-out",
                        isProductsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                      )}
                    >
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                        {link.dropdownItems?.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group/item"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy group-hover/item:bg-navy group-hover/item:text-gold transition-colors">
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <span className="block text-sm font-semibold text-navy">
                                {item.name}
                              </span>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    isActive
                      ? "text-gold"
                      : "text-white/80"
                  )}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-navy border-l-white/10 w-[300px] sm:w-[350px] p-0">
              <SheetHeader className="p-6 border-b border-white/10 text-left">
                <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white/5">
                    <Image
                      src="/logo.png"
                      alt="YIF Capital"
                      fill
                      className="object-cover"
                    />
                  </div>
                  YIF Capital
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-6 px-6 gap-6 overflow-y-auto max-h-[calc(100vh-80px)]">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors",
                      pathname === "/" ? "text-gold" : "text-white/80 hover:text-white"
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    href="/academy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors",
                      pathname === "/academy" ? "text-gold" : "text-white/80 hover:text-white"
                    )}
                  >
                    YIF Academy
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors",
                      pathname === "/analytics" ? "text-gold" : "text-white/80 hover:text-white"
                    )}
                  >
                    YIF Analytics <span className="text-xs text-gold border border-gold/20 bg-gold/10 px-1.5 py-0.5 rounded ml-2">Soon</span>
                  </Link>
                  <Link
                    href="https://forum.yifcapital.co.tz"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-white/80 hover:text-white transition-colors"
                  >
                    YIF Forum
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors",
                      pathname === "/contact" ? "text-gold" : "text-white/80 hover:text-white"
                    )}
                  >
                    Contact
                  </Link>
                </div>

                <div className="h-px bg-white/10 my-2" />

                <div className="flex flex-col gap-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-1 py-2">
                        <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold border border-gold/30">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold line-clamp-1">{user.name}</span>
                          <span className="text-white/50 text-xs lowercase">{user.role}</span>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex text-lg font-medium text-white/90 hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex text-lg font-medium text-destructive hover:text-destructive/80 transition-colors text-left"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex text-lg font-medium text-white/90 hover:text-white transition-colors"
                      >
                        Sign In
                      </Link>
                      <Button
                        asChild
                        className="bg-gold text-navy hover:bg-gold/90 border-none font-semibold w-full h-11 text-base"
                      >
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-sm font-semibold text-white leading-tight">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-gold font-bold uppercase tracking-wider">{user.role}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="h-9 w-9 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold border border-gold/20 hover:bg-gold/20 transition-all group/avatar relative"
                    title="Sign Out"
                  >
                    {user.name.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-navy rounded-full" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className="bg-gold text-navy hover:bg-gold/90 border-none font-semibold h-9 px-5"
                >
                  <Link href="/register">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
