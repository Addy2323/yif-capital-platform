"use client"

import { Users, TrendingUp, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { BULK_GROUP_IDS, type BulkGroupId } from "@/lib/bulk-sms-recipients"
import { GROUP_META } from "./types"

const ICONS = {
  Users,
  TrendingUp,
  Shield,
} as const

type Props = {
  selected: Set<BulkGroupId>
  onToggle: (id: BulkGroupId) => void
  counts: Record<BulkGroupId, number>
}

const accent: Record<BulkGroupId, string> = {
  all_members:
    "border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/10 data-[active=true]:border-sky-500 data-[active=true]:bg-sky-500/15 data-[active=true]:ring-2 data-[active=true]:ring-sky-500/30",
  pro_investors:
    "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-500/15 data-[active=true]:ring-2 data-[active=true]:ring-amber-500/30",
  yif_team:
    "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-500/15 data-[active=true]:ring-2 data-[active=true]:ring-emerald-500/30",
}

export function RecipientGroupCards({ selected, onToggle, counts }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {BULK_GROUP_IDS.map((id) => {
        const meta = GROUP_META[id]
        const Icon = ICONS[meta.iconName]
        const isOn = selected.has(id)
        const count = counts[id] ?? 0
        return (
          <button
            key={id}
            type="button"
            data-active={isOn}
            onClick={() => onToggle(id)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
              accent[id]
            )}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  id === "all_members" && "bg-sky-500/20 text-sky-400",
                  id === "pro_investors" && "bg-amber-500/20 text-amber-400",
                  id === "yif_team" && "bg-emerald-500/20 text-emerald-400"
                )}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                  id === "all_members" && "bg-sky-500/20 text-sky-300",
                  id === "pro_investors" && "bg-amber-500/20 text-amber-200",
                  id === "yif_team" && "bg-emerald-500/20 text-emerald-200"
                )}
              >
                {count.toLocaleString()} users
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{meta.label}</p>
              <p className="mt-1 text-sm text-white/55 leading-relaxed">{meta.description}</p>
            </div>
            <p className="text-xs text-white/40">
              {isOn ? "Selected — included in send" : "Tap to include this group"}
            </p>
          </button>
        )
      })}
    </div>
  )
}
