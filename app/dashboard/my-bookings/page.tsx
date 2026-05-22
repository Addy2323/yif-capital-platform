"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MyBookingsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/lms/bookings") }, [router])
  return null
}
