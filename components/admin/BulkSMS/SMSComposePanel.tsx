"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { BulkGroupId } from "@/lib/bulk-sms-recipients"
import { RecipientGroupCards } from "./RecipientGroupCards"
import { GROUP_META } from "./types"
import { useBulkSMS } from "./useBulkSMS"

const MAX = 160

function groupBadgeClass(id: string): string {
  if (id === "all_members") return "border-sky-500/50 bg-sky-500/15 text-sky-300"
  if (id === "pro_investors") return "border-amber-500/50 bg-amber-500/15 text-amber-200"
  if (id === "yif_team") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
  return "border-white/20 bg-white/5 text-white/80"
}

type Props = {
  groupCounts: Record<BulkGroupId, number>
  unitCostTzs: number
  onSent: () => void
}

export function SMSComposePanel({ groupCounts, unitCostTzs, onSent }: Props) {
  const { send, loading } = useBulkSMS()
  const [selected, setSelected] = useState<Set<BulkGroupId>>(new Set())
  const [message, setMessage] = useState("")
  const [scheduleOn, setScheduleOn] = useState(false)
  const [scheduleLocal, setScheduleLocal] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [combinedCount, setCombinedCount] = useState(0)

  const len = message.length
  const warn = len >= 140

  const estimatedTzs = combinedCount * unitCostTzs

  const selectedList = useMemo(() => Array.from(selected), [selected])

  useEffect(() => {
    if (selectedList.length === 0) {
      setCombinedCount(0)
      return
    }
    const q = new URLSearchParams()
    selectedList.forEach((g) => q.append("groups", g))
    let cancelled = false
    fetch(`/api/admin/bulk-sms/estimate?${q.toString()}`)
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        if (!cancelled && typeof d.count === "number") setCombinedCount(d.count)
      })
      .catch(() => {
        if (!cancelled) setCombinedCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [selectedList])

  const selectionSummary = useMemo(() => {
    if (selectedList.length === 0) return "No groups selected"
    const labels = selectedList.map((id) => GROUP_META[id].label)
    if (labels.length === 1) return labels[0]
    if (labels.length === 2) return `${labels[0]} + ${labels[1]}`
    return `${labels[0]} + ${labels[1]} + ${labels[2]}`
  }, [selectedList])

  const toggleGroup = (id: BulkGroupId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openConfirm = () => {
    if (selectedList.length === 0) {
      toast.error("Select at least one recipient group")
      return
    }
    if (!message.trim()) {
      toast.error("Enter a message")
      return
    }
    if (message.length > MAX) {
      toast.error(`Message must be ${MAX} characters or less`)
      return
    }
    if (scheduleOn) {
      if (!scheduleLocal) {
        toast.error("Pick a date and time for scheduled send")
        return
      }
      const d = new Date(scheduleLocal)
      if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now() + 15_000) {
        toast.error("Schedule time must be at least 1 minute in the future")
        return
      }
    }
    setConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    const scheduleAt =
      scheduleOn && scheduleLocal ? new Date(scheduleLocal).toISOString() : null

    const result = await send({
      groups: selectedList,
      message: message.trim(),
      scheduleAt,
    })

    setConfirmOpen(false)

    if (!result || "error" in result) {
      if (result && "error" in result) toast.error(result.error)
      return
    }

    const groupsN = selectedList.length
    toast.success(`✓ SMS sent to ${result.recipientCount} recipients across ${groupsN} group(s)`)
    setMessage("")
    setScheduleOn(false)
    setScheduleLocal("")
    setSelected(new Set())
    onSent()
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white">Recipient groups</h3>
        <p className="mt-1 text-sm text-white/55">
          Select one or more groups. Overlap is deduplicated automatically.
        </p>
        <div className="mt-4">
          <RecipientGroupCards
            selected={selected}
            onToggle={toggleGroup}
            counts={groupCounts}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
          <span className="font-medium text-amber-400/90">Combined recipients:</span>
          <span className="tabular-nums text-lg font-bold text-white">{combinedCount}</span>
          <span className="text-white/45">—</span>
          <span className="text-white/70">{selectionSummary}</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="sms-body" className="text-base text-white">
            Message
          </Label>
          <span
            className={`text-sm tabular-nums ${warn ? "text-amber-400 font-medium" : "text-white/45"}`}
          >
            {len} / {MAX}
          </span>
        </div>
        <Textarea
          id="sms-body"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          placeholder="Write your SMS. One segment — max 160 characters."
          className="min-h-[120px] border-white/10 bg-slate-950/50 text-white placeholder:text-white/35 focus-visible:ring-amber-400/40"
          maxLength={MAX}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id="schedule"
            checked={scheduleOn}
            onCheckedChange={(v) => setScheduleOn(Boolean(v))}
          />
          <div>
            <Label htmlFor="schedule" className="text-white cursor-pointer">
              Schedule SMS
            </Label>
            <p className="text-xs text-white/45">Deliver via Beem at the chosen time</p>
          </div>
        </div>
        {scheduleOn && (
          <input
            type="datetime-local"
            value={scheduleLocal}
            onChange={(e) => setScheduleLocal(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          />
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-sm text-white/70">
          <p>
            Estimated cost:{" "}
            <span className="font-semibold text-amber-400 tabular-nums">
              {estimatedTzs.toLocaleString()} TZS
            </span>
          </p>
          <p className="text-xs text-white/40">
            {combinedCount} × {unitCostTzs} TZS per SMS (server config)
          </p>
        </div>
        <Button
          type="button"
          onClick={openConfirm}
          disabled={loading}
          className="h-12 bg-amber-500 text-slate-950 hover:bg-amber-400"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send now
            </>
          )}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm bulk SMS</DialogTitle>
            <DialogDescription className="text-white/55">
              Review before messages are sent through Beem Africa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-white/45">Message</p>
              <p className="mt-1 whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-3 text-white/90">
                {message.trim()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-white/45">Groups</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedList.map((g) => (
                  <Badge key={g} variant="outline" className={groupBadgeClass(g)}>
                    {GROUP_META[g].label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
              <span className="text-white/55">Recipients (deduplicated)</span>
              <span className="font-semibold tabular-nums text-white">{combinedCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/55">Estimated cost</span>
              <span className="font-semibold tabular-nums text-amber-400">
                {estimatedTzs.toLocaleString()} TZS
              </span>
            </div>
            {scheduleOn && scheduleLocal && (
              <div className="flex justify-between gap-4">
                <span className="text-white/55">Scheduled</span>
                <span className="text-right text-amber-200/90">
                  {new Date(scheduleLocal).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => void handleConfirmSend()}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
