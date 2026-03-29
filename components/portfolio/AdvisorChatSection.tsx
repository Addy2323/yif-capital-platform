"use client"

import { useCallback, useState } from "react"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  ChevronDown,
  LineChart,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"

export type AdvisorQuestionGroup = { label: string; items: string[] }

export const ADVISOR_QUESTION_GROUPS: AdvisorQuestionGroup[] = [
  {
    label: "Ideas & research",
    items: [
      "What are five DSE stocks worth researching this quarter, and why?",
      "How would I build a watchlist from today's market snapshot?",
      "Which sectors on the DSE look more defensive vs more cyclical right now?",
      "Compare large-cap vs smaller listings on the DSE — what trade-offs should I know?",
      "What should I check before buying a bank stock versus an industrial stock?",
      "Give me a simple checklist for screening a DSE company before I invest.",
    ],
  },
  {
    label: "Portfolio & risk",
    items: [
      "How should I diversify a small portfolio on the DSE?",
      "What share of my savings is reasonable in equities versus keeping cash?",
      "How should a low-risk investor think about volatility on the DSE?",
      "What is a simple rebalancing rule for a casual long-term investor?",
      "Explain correlation in plain terms for a two-stock portfolio.",
      "I can only buy one stock a month — how do I phase in over a year?",
    ],
  },
  {
    label: "Reading the market",
    items: [
      "How do I interpret daily price change % and volume on the YIF stocks table?",
      "What does P/E ratio roughly mean, and when can it mislead me?",
      "What is market cap, and why does liquidity matter for small investors?",
      "What is the difference between dividend, DPS, and dividend yield?",
      "What sections of an annual report matter most for a retail investor?",
      "How do I read momentum or trend from recent price history (high level)?",
    ],
  },
  {
    label: "Tanzania & DSE",
    items: [
      "What mistakes do first-time DSE retail investors often make?",
      "How is investing on the DSE different from US or global markets?",
      "Outline the high-level steps from CDS account to placing my first trade.",
      "Ninawezaje kuanza kuwekeza kwenye soko la hisa la DSE? (Jibu kwa Kiswahili.)",
      "What should I know about mobile money, brokers, and fees in Tanzania?",
    ],
  },
  {
    label: "Funds, bonds & balance",
    items: [
      "When might unit trusts or government bonds fit better than single stocks?",
      "How can I compare stock dividends to bond or T-bill yields in TZS terms?",
      "Stocks vs bonds on the DSE — how do I mix them by age or goal?",
      "What is dollar-cost averaging and does it apply to monthly DSE buys?",
      "Explain inflation and interest rates in simple terms for an equity investor.",
    ],
  },
]

export const SUGGESTED_ADVISOR_QUESTIONS = ADVISOR_QUESTION_GROUPS.flatMap(
  (g) => g.items
)

const VISIBLE_GROUP_COUNT = 2

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
  const [open, setOpen] = useState(false)
  const [userRisk, setUserRisk] = useState<"low" | "medium" | "high">(defaultRisk)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [moreOpen, setMoreOpen] = useState(false)

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
        const json = await res.json()
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
    [userRisk, holdingsSummary, loading]
  )

  const launcher = (
    <>
      {launchVariant === "fab" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-400 to-amber-600 text-navy shadow-xl shadow-amber-900/30 transition hover:scale-105 hover:shadow-2xl hover:shadow-amber-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "md:bottom-8 md:right-8 md:h-16 md:w-16",
            open && "pointer-events-none scale-90 opacity-0"
          )}
          aria-label="Open AI advisor chat"
        >
          <div className="relative">
            <LineChart className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.25} />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-navy/90 md:h-4 md:w-4" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-1 text-left shadow-md transition hover:border-amber-500/35 hover:shadow-lg",
            tone === "portfolio" &&
              "border-[#24427E] bg-gradient-to-br from-[#0a1f44]/40 to-[#1A3A6E]/30 shadow-lg shadow-black/30 hover:border-[#D4A017]/50",
            launcherClassName
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
                  DSE
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-sm text-muted-foreground",
                  tone === "portfolio" && "text-[#B0B8C1]"
                )}
              >
                Market ideas, portfolio risk, Kiswahili questions — tap to open a
                full conversation. Educational only.
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
            <div className="shrink-0 border-b border-border/50 px-4 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick prompts
              </p>
              <div className="space-y-3">
                {ADVISOR_QUESTION_GROUPS.slice(0, VISIBLE_GROUP_COUNT).map(
                  (group) => (
                    <div key={group.label}>
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                        {group.label}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((q, i) => (
                          <button
                            key={`${group.label}-${i}`}
                            type="button"
                            disabled={loading}
                            onClick={() => void send(q)}
                            className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-left text-[11px] leading-snug text-muted-foreground transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-foreground disabled:opacity-50"
                          >
                            {q.length > 70 ? `${q.slice(0, 70)}…` : q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
                <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs text-muted-foreground"
                      disabled={loading}
                    >
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          moreOpen && "rotate-180"
                        )}
                      />
                      More ideas (
                      {ADVISOR_QUESTION_GROUPS.slice(VISIBLE_GROUP_COUNT).reduce(
                        (n, g) => n + g.items.length,
                        0
                      )}
                      )
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    {ADVISOR_QUESTION_GROUPS.slice(VISIBLE_GROUP_COUNT).map(
                      (group) => (
                        <div key={group.label}>
                          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                            {group.label}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map((q, i) => (
                              <button
                                key={`${group.label}-${i}`}
                                type="button"
                                disabled={loading}
                                onClick={() => void send(q)}
                                className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-left text-[11px] leading-snug text-muted-foreground transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-foreground disabled:opacity-50"
                              >
                                {q.length > 70 ? `${q.slice(0, 70)}…` : q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="space-y-3 py-4 pr-2">
                {turns.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                    <Sparkles className="mx-auto mb-2 h-8 w-8 text-amber-500/60" />
                    <p className="text-sm text-muted-foreground">
                      Choose a quick prompt or type your own question below.
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
