"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BulkGroupId } from "@/lib/bulk-sms-recipients"
import type { BulkSmsLogRow, BulkSmsStats } from "./types"
import { SMSStatsCards } from "./SMSStatsCards"
import { SMSComposePanel } from "./SMSComposePanel"
import { SMSHistoryTable } from "./SMSHistoryTable"

const EMPTY_COUNTS: Record<BulkGroupId, number> = {
  all_members: 0,
  pro_investors: 0,
  yif_team: 0,
}

type ApiPayload = {
  stats: BulkSmsStats
  groupCounts: Record<BulkGroupId, number>
  unitCostTzs: number
  logs: {
    items: BulkSmsLogRow[]
    total: number
    page: number
    limit: number
  }
}

export function BulkSMSSection() {
  const [tab, setTab] = useState("compose")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ApiPayload | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bulk-sms?page=${p}&limit=10`)
      if (!res.ok) throw new Error("load failed")
      const json = (await res.json()) as ApiPayload
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page)
  }, [load, page])

  const refresh = useCallback(() => {
    void load(page)
  }, [load, page])

  const stats = data?.stats ?? null
  const groupCounts = data?.groupCounts ?? EMPTY_COUNTS
  const unitCost = data?.unitCostTzs ?? 25
  const logs = data?.logs

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <section className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Bulk SMS</h1>
        <p className="text-sm text-white/55 md:text-base">
          Targeted SMS campaigns via Beem Africa — luxury fintech messaging for YIF Capital members.
        </p>
      </section>

      <SMSStatsCards stats={stats} loading={loading} />

      <Tabs value={tab} onValueChange={setTab} className="w-full gap-6">
        <TabsList className="grid h-11 w-full max-w-md grid-cols-2 border border-white/10 bg-slate-950/80 p-1">
          <TabsTrigger
            value="compose"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-white/70"
          >
            Compose
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-white/70"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="compose"
          className="mt-6 rounded-xl border border-white/10 bg-slate-900/50 p-4 shadow-xl sm:p-6 md:p-8"
        >
          <SMSComposePanel
            groupCounts={groupCounts}
            unitCostTzs={unitCost}
            onSent={() => {
              refresh()
              setTab("history")
            }}
          />
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-6 rounded-xl border border-white/10 bg-slate-900/50 p-4 shadow-xl sm:p-6"
        >
          <SMSHistoryTable
            rows={logs?.items ?? []}
            total={logs?.total ?? 0}
            page={logs?.page ?? page}
            limit={logs?.limit ?? 10}
            onPageChange={setPage}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
