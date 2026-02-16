"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, BarChart3, GraduationCap, Briefcase, ChevronDown, MessagesSquare } from "lucide-react"

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Products",
    href: "#",
    children: [
      { name: "YIF Analytics (Coming Soon)", href: "#", icon: BarChart3, description: "Market data & analysis" },
      { name: "YIF Academy", href: "/academy", icon: GraduationCap, description: "Investment education" },
      { name: "YIF Forum", href: "https://forum.yifcapital.co.tz", icon: MessagesSquare, description: "Community & discussion" },
    ],
  },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-navy border-b border-white/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="YIF Capital" width={44} height={44} className="rounded-full" />
          <span className="text-xl font-bold text-white tracking-tight">YIF Capital</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-10">
          {navigation.map((item) =>
            item.children ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <button className="group relative flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white">
                    {item.name}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.name} asChild>
                      <Link href={child.href} className="flex items-start gap-3 p-3 transition-colors hover:bg-muted">
                        <child.icon className="mt-0.5 h-5 w-5 text-gold" />
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-xs text-muted-foreground">{child.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-navy">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                    {user.subscription?.plan || "Free"} Plan
                  </span>
                </div>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gold text-navy transition-all duration-300 hover:bg-gold/90 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 active:translate-y-0">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-4">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name} className="space-y-1">
                  <div className="px-3 py-2 text-sm font-medium text-white/60">{item.name}</div>
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <child.icon className="h-5 w-5 text-gold" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
            <div className="border-t border-border pt-4">
              {user ? (
                <>
                  <div className="mb-3 flex items-center gap-3 px-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {/* <Link
                    href="/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link> */}
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full bg-gold text-navy hover:bg-gold/90">
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
