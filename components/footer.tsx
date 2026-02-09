import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  products: [
    { name: "YIF Analytics", href: "/analytics" },
    { name: "YIF Academy", href: "/academy" },
    { name: "YIF Investment Pro", href: "/investment-pro" },
    { name: "API Access", href: "/api-access" },
  ],
  resources: [
    { name: "Market Research", href: "/research" },
    { name: "Learning Center", href: "/academy" },
    { name: "Documentation", href: "/docs" },
    { name: "Blog", href: "/blog" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Press", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Compliance", href: "/compliance" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="YIF Capital" width={40} height={40} className="h-10 w-10" />
              <span className="text-xl font-bold">YIF Capital</span>
            </Link>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Empowering individuals and institutions through data, learning, and investing tools for the Tanzanian and
              regional capital markets.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-gold">Products</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gold">Resources</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gold">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gold">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} YIF Capital Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* <span className="text-xs text-white/50">Regulated by Capital Markets and Securities Authority (CMSA)</span> */}
          </div>
        </div>
      </div>
    </footer>
  )
}
