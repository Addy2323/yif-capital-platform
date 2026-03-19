import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SweetAlertProvider } from '@/components/ui/sweet-alert'
import { Toaster } from '@/components/ui/sonner'
import { StartupLoader } from '@/components/startup-loader'
import { AdminDataProvider } from '@/lib/admin-data-context'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yifcapital.co.tz"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YIF Capital | Tanzania Digital Investment & Fund Analytics Platform",
    template: "%s | YIF Capital",
  },
  description:
    "YIF Capital is Tanzania's trusted digital investment platform. Access real-time fund NAV, mutual fund analytics, DSE stocks, and passive income tools. Regulated, secure, and built for Tanzanian investors.",
  keywords: [
    "investment Tanzania",
    "mutual funds Tanzania",
    "DSE stocks",
    "fund NAV",
    "passive income Tanzania",
    "capital markets Tanzania",
    "yif capital",
  ],
  generator: "YIF Capital",
  authors: [{ name: "YIF Capital", url: SITE_URL }],
  creator: "YIF Capital",
  publisher: "YIF Capital",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_TZ",
    url: SITE_URL,
    siteName: "YIF Capital",
    title: "YIF Capital | Tanzania Digital Investment & Fund Analytics Platform",
    description:
      "Tanzania's trusted digital investment platform. Real-time fund NAV, mutual fund analytics, DSE stocks, and passive income tools for Tanzanian investors.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "YIF Capital Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YIF Capital | Tanzania Digital Investment Platform",
    description: "Real-time fund analytics, DSE stocks & passive income tools for Tanzanian investors.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "6422a9cd98c76333",
  },
  category: "finance",
}

export const viewport: Viewport = {
  themeColor: '#0A1F44',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "YIF Capital",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Tanzania's digital investment and fund analytics platform. Real-time NAV, mutual funds, DSE stocks, and passive income tools.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ohio Street",
      addressLocality: "Dar es Salaam",
      addressCountry: "TZ",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@yifcapital.co.tz",
      contactType: "customer service",
      areaServed: "TZ",
      availableLanguage: "English, Swahili",
    },
    sameAs: [
      "https://twitter.com/yifcapital",
      "https://www.facebook.com/yifcapital",
      "https://www.linkedin.com/company/yif-capital",
    ],
  }

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <StartupLoader />
        <AuthProvider>
          <AdminDataProvider>
            <SweetAlertProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--card)',
                    color: 'var(--card-foreground)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
            </SweetAlertProvider>
          </AdminDataProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
