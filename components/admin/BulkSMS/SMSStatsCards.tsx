"use client"

import { MessageSquare, Users, Percent, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BulkSmsStats } from "./types"

type Props = {
  stats: BulkSmsStats | null
  loading?: boolean
}

export function SMSStatsCards({ stats, loading }: Props) {
  const s = stats ?? {
    totalSmsSent: 0,
    totalRecipientsReached: 0,
    deliveryRatePct: 0,
    scheduledPending: 0,
  }

  const tiles = [
    {
      title: "Total SMS Sent",
      value: s.totalSmsSent.toLocaleString(),
      description: "All-time bulk campaigns",
      icon: MessageSquare,
    },
    {
      title: "Recipients Reached",
      value: s.totalRecipientsReached.toLocaleString(),
      description: "Sum of all deliveries",
      icon: Users,
    },
    {
      title: "Delivery Rate",
      value: `${s.deliveryRatePct.toFixed(1)}%`,
      description: "Delivered ÷ attempted",
      icon: Percent,
    },
    {
      title: "Scheduled Pending",
      value: s.scheduledPending.toLocaleString(),
      description: "Awaiting send time",
      icon: Clock,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t) => (
        <Card
          key={t.title}
          className="border-white/10 bg-slate-900/80 text-white shadow-lg backdrop-blur"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">{t.title}</CardTitle>
            <t.icon className="h-4 w-4 text-amber-400" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-white">
              {loading ? "—" : t.value}
            </div>
            <CardDescription className="mt-1 text-xs text-white/45">
              {t.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
