"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  authUserHasPremiumFeatures,
  loginRedirectUrl,
  SUBSCRIBE_PLAN_URL,
} from "@/lib/subscription-tier"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  Loader2,
  Send,
  LineChart,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react"
import { toast } from "sonner"

export interface AdvisorChatSectionProps {
  holdingsSummary?: string
  defaultRisk?: "low" | "medium" | "high"
  /**
   * inline — wide CTA card in the page flow.
   * fab — floating chart button (e.g. stocks page).
   */
  launchVariant?: "inline" | "fab"
  /** Match YIF portfolio dark styling (navy / gold). */
  tone?: "default" | "portfolio"
  /** Optional extra classes on the inline launcher. */
  launcherClassName?: string
}

type ChatTurn = { role: "user" | "assistant"; content: string }

export function AdvisorChatSection({
  holdingsSummary,
  defaultRisk = "medium",
  launchVariant = "inline",
  tone = "default",
  launcherClassName,
}: AdvisorChatSectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading: authLoading } = useAuth()
  const hasPremium = authUserHasPremiumFeatures(user)

  const [open, setOpen] = useState(false)
  const [userRisk, setUserRisk] = useState<"low" | "medium" | "high">(defaultRisk)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])

  const openChatIfAllowed = useCallback(() => {
    if (authLoading) return
    if (!user) {
      router.push(loginRedirectUrl(pathname || "/"))
      return
    }
    if (!hasPremium) {
      router.push(SUBSCRIBE_PLAN_URL)
      return
    }
    setOpen(true)
  }, [authLoading, user, hasPremium, router, pathname])

  const send = useCallback(
    async (text: string) => {
      const q = text.trim()
      if (!q) {
        toast.error("Type a question first.")
        return
      }
      if (loading) return
      setLoading(true)
      setTurns((t) => [...t, { role: "user", content: q }])
      setInput("")
      try {
        const res = await fetch("/api/ai-advisor-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: q,
            userRisk,
            holdingsSummary: holdingsSummary || undefined,
          }),
        })
        const json = (await res.json()) as {
          success?: boolean
          error?: string
          code?: string
          subscribeUrl?: string
        }
        if (res.status === 401 || res.status === 403) {
          if (json.code === "SUBSCRIPTION_REQUIRED" && json.subscribeUrl) {
            setTurns((t) => (t.length ? t.slice(0, -1) : t))
            router.push(json.subscribeUrl)
            toast.message("Subscribe to use the AI advisor.")
            return
          }
          if (json.code === "AUTH_REQUIRED" && json.subscribeUrl) {
            setTurns((t) => (t.length ? t.slice(0, -1) : t))
            router.push(json.subscribeUrl)
            toast.message("Log in to use the AI advisor.")
            return
          }
        }
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Request failed")
        }
        const reply = String(json.data?.reply ?? "")
        setTurns((t) => [...t, { role: "assistant", content: reply }])
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not get a reply"
        toast.error(msg)
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content:
              "Sorry — something went wrong. Please try again in a moment.",
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [userRisk, holdingsSummary, loading, router]
  )

  const launcher = (
    <>
      {launchVariant === "fab" ? (
        <button
          type="button"
          onClick={() => openChatIfAllowed()}
          disabled={authLoading}
          className={cn(
            "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-400 to-amber-600 text-navy shadow-xl shadow-amber-900/30 transition hover:scale-105 hover:shadow-2xl hover:shadow-amber-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "md:bottom-8 md:right-8 md:h-16 md:w-16",
            open && "pointer-events-none scale-90 opacity-0",
            (!hasPremium || !user) &&
              !authLoading &&
              "ring-2 ring-navy/30 dark:ring-white/20",
            authLoading && "opacity-70"
          )}
          aria-label={
            hasPremium && user
              ? "Open AI advisor chat"
              : "AI advisor — subscribe to unlock"
          }
        >
          <div className="relative">
            <LineChart className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.25} />
            {hasPremium && user ? (
              <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-navy/90 md:h-4 md:w-4" />
            ) : (
              <Lock className="absolute -right-1 -top-1 h-3 w-3 text-navy md:h-3.5 md:w-3.5" />
            )}
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openChatIfAllowed()}
          disabled={authLoading}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-1 text-left shadow-md transition hover:border-amber-500/35 hover:shadow-lg",
            tone === "portfolio" &&
              "border-[#24427E] bg-gradient-to-br from-[#0a1f44]/40 to-[#1A3A6E]/30 shadow-lg shadow-black/30 hover:border-[#D4A017]/50",
            launcherClassName,
            authLoading && "pointer-events-none opacity-70"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-4 rounded-xl bg-background/40 px-4 py-4 backdrop-blur-sm sm:px-5 sm:py-5",
              tone === "portfolio" &&
                "border border-[#24427E]/80 bg-[#0D2654]/90"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-navy shadow-inner sm:h-16 sm:w-16",
                tone === "portfolio" &&
                  "shadow-[0_0_24px_rgba(212,160,23,0.2)] ring-2 ring-[#D4A017]/35"
              )}
            >
              <div className="relative">
                <LineChart className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.25} />
                <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-base font-bold tracking-tight sm:text-lg",
                    tone === "portfolio" && "text-[#e8f0fe]"
                  )}
                >
                  Chat with your AI advisor
                </span>
                <span
                  className={cn(
                    "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400",
                    tone === "portfolio" &&
                      "bg-[#D4A017]/20 text-[#D4A017]"
                  )}
                >
                  {hasPremium && user ? "DSE" : "Pro"}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-sm text-muted-foreground",
                  tone === "portfolio" && "text-[#B0B8C1]"
                )}
              >
                {hasPremium && user
                  ? "Market ideas, portfolio risk, Kiswahili questions — tap to open a full conversation. Educational only."
                  : user
                    ? "Subscribe to chat with the AI market advisor. Educational only."
                    : "Log in and subscribe to unlock the AI market advisor."}
              </p>
            </div>
            <div
              className={cn(
                "hidden shrink-0 sm:flex sm:h-10 sm:w-10 sm:items-center sm:justify-center sm:rounded-full sm:border sm:border-border/80 sm:bg-muted/50 sm:transition sm:group-hover:border-amber-500/40 sm:group-hover:bg-amber-500/10",
                tone === "portfolio" &&
                  "sm:border-[#24427E] sm:bg-[#1A3A6E]/80 sm:group-hover:border-[#D4A017]/50 sm:group-hover:bg-[#D4A017]/10"
              )}
            >
              <ArrowRight
                className={cn(
                  "h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400",
                  tone === "portfolio" && "text-[#B0B8C1] group-hover:text-[#D4A017]"
                )}
              />
            </div>
          </div>
        </button>
      )}
    </>
  )

  return (
    <>
      {launcher}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full max-h-[100dvh] flex-col gap-0 border-l border-border/60 p-0 sm:max-w-lg md:max-w-xl"
        >
          <div className="relative shrink-0 border-b border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 pb-5 pt-6 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,160,23,0.12),transparent_55%)]" />
            <SheetHeader className="relative space-y-1 p-0 text-left">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold tracking-tight text-white">
                    AI market advisor
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-400">
                    Powered by live DSE snapshot when available · Not personal
                    financial advice
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="relative mt-4 flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-slate-500">
                  Risk profile
                </Label>
                <Select
                  value={userRisk}
                  onValueChange={(v) =>
                    setUserRisk(v as "low" | "medium" | "high")
                  }
                >
                  <SelectTrigger className="h-9 w-[140px] border-slate-600 bg-slate-900/80 text-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {holdingsSummary ? (
                <p className="max-w-full flex-1 text-[11px] leading-snug text-slate-500">
                  Holdings context:{" "}
                  <span className="text-slate-400">{holdingsSummary}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-0">
            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="space-y-3 py-4 pr-2">
                {turns.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                    <Sparkles className="mx-auto mb-2 h-8 w-8 text-amber-500/60" />
                    <p className="text-sm text-muted-foreground">
                      Type your question below to get started.
                    </p>
                  </div>
                ) : (
                  turns.map((turn, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-xl px-3.5 py-3 text-sm leading-relaxed",
                        turn.role === "user"
                          ? "ml-4 border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent"
                          : "mr-2 border border-border/60 bg-muted/25 whitespace-pre-wrap"
                      )}
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {turn.role === "user" ? (
                          "You"
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            Advisor
                          </>
                        )}
                      </div>
                      {turn.content}
                    </div>
                  ))
                )}
                {loading ? (
                  <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    Thinking…
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <Label
                htmlFor="advisor-chat-input"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Your question
              </Label>
              <Textarea
                id="advisor-chat-input"
                placeholder="e.g. Top 5 DSE names to research · rebalancing · CDS fees…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                disabled={loading}
                className="mt-2 min-h-[72px] resize-none border-border/80 bg-muted/20 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim() && !loading) void send(input)
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                {turns.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    disabled={loading}
                    onClick={() => setTurns([])}
                  >
                    Clear chat
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="button"
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-navy hover:from-amber-400 hover:to-amber-500"
                  onClick={() => void send(input)}
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
