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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, MessageCircleQuestion, Send, ChevronDown } from "lucide-react"
import { toast } from "sonner"

export type AdvisorQuestionGroup = { label: string; items: string[] }

/** Grouped prompts — shown in the UI; flat list kept for imports/tests. */
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
  /** Optional one-line summary of holdings, e.g. \"CRDB x100, NMB x50\" */
  holdingsSummary?: string
  defaultRisk?: "low" | "medium" | "high"
}

type ChatTurn = { role: "user" | "assistant"; content: string }

export function AdvisorChatSection({
  holdingsSummary,
  defaultRisk = "medium",
}: AdvisorChatSectionProps) {
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
    [userRisk, holdingsSummary]
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <MessageCircleQuestion className="h-6 w-6 text-gold" />
            Ask the advisor
          </h2>
          <p className="text-sm text-muted-foreground">
            Ask anything about DSE investing: top ideas to research, portfolio
            mix, reading prices, or Kiswahili questions. Live scrape context is
            attached when available. Educational only — not personal advice.
          </p>
        </div>
        <div className="space-y-2 sm:w-[200px]">
          <Label>Risk profile</Label>
          <Select
            value={userRisk}
            onValueChange={(v) => setUserRisk(v as "low" | "medium" | "high")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {ADVISOR_QUESTION_GROUPS.slice(0, VISIBLE_GROUP_COUNT).map((group) => (
          <div key={group.label}>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.items.map((q, i) => (
                <button
                  key={`${group.label}-${i}`}
                  type="button"
                  disabled={loading}
                  onClick={() => void send(q)}
                  className="rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {q.length > 78 ? `${q.slice(0, 78)}…` : q}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-dashed"
              disabled={loading}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
              More question ideas (
              {ADVISOR_QUESTION_GROUPS.slice(VISIBLE_GROUP_COUNT).reduce(
                (n, g) => n + g.items.length,
                0
              )}
              )
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {ADVISOR_QUESTION_GROUPS.slice(VISIBLE_GROUP_COUNT).map((group) => (
              <div key={group.label}>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((q, i) => (
                    <button
                      key={`${group.label}-${i}`}
                      type="button"
                      disabled={loading}
                      onClick={() => void send(q)}
                      className="rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {q.length > 78 ? `${q.slice(0, 78)}…` : q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversation</CardTitle>
          <CardDescription>
            Replies may use your risk level
            {holdingsSummary ? " and a short note of your holdings" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {turns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tap a quick prompt above (open &quot;More question ideas&quot; for
              dozens more) or write your own below.
            </p>
          ) : (
            <ScrollArea className="h-[min(360px,50vh)] pr-3">
              <div className="space-y-3 text-sm">
                {turns.map((turn, i) => (
                  <div
                    key={i}
                    className={
                      turn.role === "user"
                        ? "rounded-lg border border-gold/25 bg-gold/5 p-3"
                        : "rounded-lg border border-border/60 bg-muted/20 p-3 whitespace-pre-wrap"
                    }
                  >
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {turn.role === "user" ? "You" : "Advisor"}
                    </div>
                    {turn.content}
                  </div>
                ))}
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking…
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          )}

          <div className="space-y-2 pt-2">
            <Label htmlFor="advisor-chat-input">Your question</Label>
            <Textarea
              id="advisor-chat-input"
              placeholder="e.g. Top 5 DSE names to research this month · Should I add more banks or diversify into industrials? · Explain CDS and fees…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              disabled={loading}
              className="resize-y min-h-[88px]"
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              {turns.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={loading}
                  onClick={() => setTurns([])}
                >
                  Clear chat
                </Button>
              ) : null}
              <Button
                type="button"
                className="bg-gold text-navy hover:bg-gold/90"
                onClick={() => void send(input)}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
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
        </CardContent>
      </Card>
    </section>
  )
}
