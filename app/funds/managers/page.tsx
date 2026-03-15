"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import {
  TANZANIAN_FUNDS_STATIC,
  mergeWithStaticFunds,
  MANAGERS_VIEW_ALL_ORDER,
  MANAGER_DISPLAY_NAME,
  getManagerSlug,
} from "@/lib/data/tanzanian-funds"

type ManagerWithFunds = { managerName: string; displayName: string; funds: typeof TANZANIAN_FUNDS_STATIC }

export default function AllFundManagersPage() {
  const [managersWithFunds, setManagersWithFunds] = useState<ManagerWithFunds[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/funds")
        const json = await res.json()
        const allFunds = mergeWithStaticFunds(json.data ?? [])
        const byManager = new Map<string, typeof TANZANIAN_FUNDS_STATIC>()
        for (const fund of allFunds) {
          const list = byManager.get(fund.manager_name) ?? []
          list.push(fund)
          byManager.set(fund.manager_name, list)
        }
        const list: ManagerWithFunds[] = MANAGERS_VIEW_ALL_ORDER.filter((name) => byManager.has(name)).map(
          (managerName) => ({
            managerName,
            displayName: MANAGER_DISPLAY_NAME[managerName] ?? managerName,
            funds: byManager.get(managerName)!,
          })
        )
        setManagersWithFunds(list)
      } catch {
        // Fallback to static order
        const byManager = new Map<string, typeof TANZANIAN_FUNDS_STATIC>()
        for (const fund of TANZANIAN_FUNDS_STATIC) {
          const list = byManager.get(fund.manager_name) ?? []
          list.push(fund)
          byManager.set(fund.manager_name, list)
        }
        setManagersWithFunds(
          MANAGERS_VIEW_ALL_ORDER.filter((name) => byManager.has(name)).map((managerName) => ({
            managerName,
            displayName: MANAGER_DISPLAY_NAME[managerName] ?? managerName,
            funds: byManager.get(managerName)!,
          }))
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalFunds = managersWithFunds.reduce((sum, m) => sum + m.funds.length, 0)

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 md:pb-12">
      <div className="bg-[#0a1628] text-white px-4 pt-6 pb-6">
        <Link
          href="/funds"
          className="inline-flex items-center text-white/80 hover:text-white text-sm font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Funds
        </Link>
        <h1 className="text-xl font-bold text-white">Fund Managers and Their Funds in Tanzania</h1>
        <p className="text-white/70 text-sm mt-1">
          {managersWithFunds.length} Fund Managers · {totalFunds} Total Funds
        </p>
      </div>

      <div className="px-4 -mt-2 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <>
            {managersWithFunds.map(({ managerName, displayName, funds }, index) => (
              <Link
                key={managerName}
                href={`/funds/managers/${getManagerSlug(managerName)}`}
                className="flex items-center justify-between w-full px-4 py-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 group text-left"
              >
                <h2 className="font-bold text-gray-900">
                  {index + 1}. {displayName} ({funds.length} Fund{funds.length !== 1 ? "s" : ""})
                </h2>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 shrink-0" />
              </Link>
            ))}

            <div className="bg-white rounded-xl shadow-sm px-4 py-4 text-center">
              <p className="text-sm font-bold text-gray-900">Total Funds: {totalFunds}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
