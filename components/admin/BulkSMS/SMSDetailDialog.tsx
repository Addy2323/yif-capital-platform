"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GROUP_META, type BulkGroupId, type BulkSmsLogRow } from "./types"

function groupBadgeClass(id: string): string {
  if (id === "all_members") return "border-sky-500/50 bg-sky-500/15 text-sky-300"
  if (id === "pro_investors") return "border-amber-500/50 bg-amber-500/15 text-amber-200"
  if (id === "yif_team") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
  return "border-white/20 bg-white/5 text-white/80"
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === "completed") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
  if (s === "scheduled") return "border-amber-500/50 bg-amber-500/15 text-amber-200"
  if (s === "failed") return "border-red-500/50 bg-red-500/15 text-red-300"
  return "border-white/20 bg-white/5 text-white/80"
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: BulkSmsLogRow | null
}

export function SMSDetailDialog({ open, onOpenChange, row }: Props) {
  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-white/10 bg-slate-900 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">SMS campaign details</DialogTitle>
          <DialogDescription className="text-white/55">
            Sent {new Date(row.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">Status</p>
            <Badge variant="outline" className={`mt-1 capitalize ${statusBadge(row.status)}`}>
              {row.status}
            </Badge>
          </div>
          <Separator className="bg-white/10" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">Message</p>
            <p className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-white/90">
              {row.message}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">
              Groups targeted
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {row.groupsTargeted.map((g) => {
                const meta = GROUP_META[g as BulkGroupId]
                const label = meta?.label ?? g
                return (
                  <Badge key={g} variant="outline" className={groupBadgeClass(g)}>
                    {label}
                  </Badge>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/45">Recipients</p>
              <p className="text-lg font-semibold tabular-nums text-white">{row.recipientCount}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/45">Est. cost (TZS)</p>
              <p className="text-lg font-semibold tabular-nums text-amber-400">
                {row.estimatedCostTzs != null ? row.estimatedCostTzs.toLocaleString() : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/45">Delivered</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-400">
                {row.deliveredCount}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/45">Failed</p>
              <p className="text-lg font-semibold tabular-nums text-red-400">{row.failedCount}</p>
            </div>
          </div>
          {row.scheduledAt && (
            <p className="text-xs text-amber-200/90">
              Scheduled for: {new Date(row.scheduledAt).toLocaleString()}
            </p>
          )}
          {row.errorMessage && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {row.errorMessage}
            </p>
          )}
          <p className="text-xs text-white/40">
            Per-network delivery breakdown by group is aggregated in this view; Beem reports overall
            valid/invalid counts per request.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
