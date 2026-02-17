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

export const metadata: Metadata = {
  title: 'YIF Capital - Investment & Analytics Platform',
  description: 'YIF Capital is a unified digital investment ecosystem designed to empower individuals and institutions through data, learning, and investing tools.',
  generator: 'YIF Capital',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
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
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <StartupLoader />
        <AdminDataProvider>
          <AuthProvider>
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
          </AuthProvider>
        </AdminDataProvider>
        <Analytics />
      </body>
    </html>
  )
}
