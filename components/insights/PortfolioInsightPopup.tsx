"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const STORAGE_PREFIX = "yif_insight_dismissed_v1:"
const POLL_MS = 120_000

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

const PATH_PREFIXES = [
  "/portfolio",
  "/stocks",
  "/dashboard",
  "/funds",
  "/research",
]

function pathAllowsInsight(pathname: string | null): boolean {
  if (!pathname) return false
  return PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

type InsightItem = {
  kind: "stock" | "fund"
  symbol: string
  name: string
  changePct: number
  price?: number
  qty?: number
  pnlPct?: number
}

type InsightPayload =
  | {
      show: true
      scrapeId: string
      insightKey: string
      kind: "holding" | "prospect"
      title: string
      body: string
      items: InsightItem[]
      source: "gemini" | "template"
    }
  | { show: false; scrapeId?: string }

function loadDismissedKey(userId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const j = JSON.parse(raw) as { insightKey?: string }
    return typeof j.insightKey === "string" ? j.insightKey : null
  } catch {
    return null
  }
}

function saveDismissed(userId: string, key: string) {
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify({ insightKey: key, at: Date.now() })
  )
}

export function PortfolioInsightPopup() {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState<InsightPayload | null>(null)

  const fetchInsight = useCallback(async () => {
    const uid = user?.id
    if (!uid) return
    if (!pathAllowsInsight(pathname)) return
    try {
      const res = await fetch("/api/portfolio/insight-alerts", {
        credentials: "include",
      })
      if (!res.ok) return
      const data = (await res.json()) as { success?: boolean } & InsightPayload
      if (!data.success || !data.show) return
      if (loadDismissedKey(uid) === data.insightKey) return
      setPayload(data)
      setOpen(true)
    } catch {
      /* ignore */
    }
  }, [user?.id, pathname])

  useEffect(() => {
    if (!user) {
      setPayload(null)
      setOpen(false)
    }
  }, [user])

  useEffect(() => {
    if (isLoading || !user) return
    if (!pathAllowsInsight(pathname)) return
    void fetchInsight()
  }, [isLoading, user, pathname, fetchInsight])

  useEffect(() => {
    if (!user || !pathAllowsInsight(pathname)) return
    const id = window.setInterval(() => void fetchInsight(), POLL_MS)
    return () => clearInterval(id)
  }, [user, pathname, fetchInsight])

  useEffect(() => {
    if (!user || !pathAllowsInsight(pathname)) return
    const onVis = () => {
      if (document.visibilityState === "visible") void fetchInsight()
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [user, pathname, fetchInsight])

  const onDismiss = () => {
    if (user?.id && payload?.show) saveDismissed(user.id, payload.insightKey)
    setOpen(false)
  }

  if (!payload?.show) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss()
        else setOpen(true)
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{payload.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Market insight based on latest DSE data. Educational only, not personal
            financial advice.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-foreground">
          {payload.items.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {payload.items.map((it) => (
                <li key={`${it.kind}:${it.symbol}`}>
                  {it.kind === "stock" ? (
                    <Link
                      href={`/stocks/${encodeURIComponent(it.symbol)}`}
                      className={cn(
                        "inline-flex rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium",
                        "hover:bg-muted"
                      )}
                    >
                      {it.symbol}{" "}
                      <span
                        className={cn(
                          "ml-1",
                          it.changePct >= 0 ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {it.changePct >= 0 ? "+" : ""}
                        {it.changePct.toFixed(2)}%
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href={`/funds/${encodeURIComponent(it.symbol)}`}
                      className={cn(
                        "inline-flex rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium",
                        "hover:bg-muted"
                      )}
                    >
                      {it.name.slice(0, 28)}
                      {it.name.length > 28 ? "…" : ""}{" "}
                      <span
                        className={cn(
                          "ml-1",
                          it.changePct >= 0 ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {it.changePct >= 0 ? "+" : ""}
                        {it.changePct.toFixed(2)}%
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {payload.body}
          </p>
          <p className="text-xs text-muted-foreground">
            Educational information only — not personal financial advice. Past
            performance does not guarantee future results.
          </p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" type="button" onClick={onDismiss}>
            Dismiss
          </Button>
          {payload.kind === "prospect" ? (
            <Button asChild>
              <Link href="/portfolio">Create portfolio</Link>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link href="/portfolio">View portfolio</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
