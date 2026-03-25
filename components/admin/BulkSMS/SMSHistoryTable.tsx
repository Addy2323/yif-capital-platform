"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GROUP_META, type BulkGroupId, type BulkSmsLogRow } from "./types"
import { SMSDetailDialog } from "./SMSDetailDialog"

function groupBadgeClass(id: string): string {
  if (id === "all_members") return "border-sky-500/50 bg-sky-500/15 text-sky-300"
  if (id === "pro_investors") return "border-amber-500/50 bg-amber-500/15 text-amber-200"
  if (id === "yif_team") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
  return "border-white/20 bg-white/5 text-white/80"
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (s === "completed") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
  if (s === "scheduled") return "border-amber-500/50 bg-amber-500/15 text-amber-200"
  if (s === "failed") return "border-red-500/50 bg-red-500/15 text-red-300"
  if (s === "partial") return "border-orange-500/50 bg-orange-500/15 text-orange-200"
  return "border-white/20 bg-white/5 text-white/80"
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s
  return `${s.slice(0, n)}…`
}

type Props = {
  rows: BulkSmsLogRow[]
  total: number
  page: number
  limit: number
  onPageChange: (p: number) => void
  loading?: boolean
}

export function SMSHistoryTable({ rows, total, page, limit, onPageChange, loading }: Props) {
  const [detail, setDetail] = useState<BulkSmsLogRow | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canPrev = page > 1
  const canNext = page < totalPages

  if (!loading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/40 py-20 text-center">
        <Inbox className="mb-3 h-12 w-12 text-white/25" aria-hidden />
        <p className="text-lg font-medium text-white">No SMS history yet</p>
        <p className="mt-1 max-w-sm text-sm text-white/45">
          When you send your first bulk campaign, delivery logs will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/80">Date</TableHead>
              <TableHead className="text-white/80">Message</TableHead>
              <TableHead className="text-white/80">Groups</TableHead>
              <TableHead className="text-right text-white/80">Recipients</TableHead>
              <TableHead className="text-right text-white/80">Delivered</TableHead>
              <TableHead className="text-right text-white/80">Failed</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    <TableCell colSpan={7} className="h-12 animate-pulse bg-white/5" />
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-white/10 hover:bg-white/5"
                    onClick={() => setDetail(row)}
                  >
                    <TableCell className="whitespace-nowrap text-sm text-white/80">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm text-white/90">
                      {truncate(row.message, 72)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.groupsTargeted.map((g) => {
                          const meta = GROUP_META[g as BulkGroupId]
                          return (
                            <Badge
                              key={g}
                              variant="outline"
                              className={`text-[10px] ${groupBadgeClass(g)}`}
                            >
                              {meta?.label ?? g}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-white">
                      {row.recipientCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-400">
                      {row.deliveredCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-400">
                      {row.failedCount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${statusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-white/45">
            Page {page} of {totalPages} — {total} campaigns total
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 bg-transparent text-white hover:bg-white/10"
              disabled={!canPrev || loading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 bg-transparent text-white hover:bg-white/10"
              disabled={!canNext || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <SMSDetailDialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)} row={detail} />
    </>
  )
}
