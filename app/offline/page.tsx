/**
 * Offline fallback — shown when navigation fails while offline (service worker).
 * Keep lightweight: no client hooks required for precache.
 */

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 py-16 text-center">
      <Image
        src="/logo.png"
        alt="YIF Capital"
        width={80}
        height={80}
        className="mb-6 h-20 w-20 rounded-full border-2 border-gold/40 object-cover"
        priority
      />
      <h1 className="text-2xl font-bold text-white md:text-3xl">You&apos;re offline</h1>
      <p className="mt-3 max-w-md text-white/75">
        We can&apos;t reach YIF Capital right now. Check your connection, then try again — cached pages may still open when you&apos;re back online.
      </p>
      <Button asChild className="mt-8 bg-gold text-navy hover:bg-gold/90">
        <Link href="/">Retry from home</Link>
      </Button>
    </div>
  )
}
