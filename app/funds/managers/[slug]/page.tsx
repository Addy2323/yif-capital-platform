"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { getManagerNameFromSlug, mergeWithStaticFunds } from "@/lib/data/tanzanian-funds"
import { FUND_TYPE_CONFIG } from "@/lib/types/funds"
import type { FundType } from "@/lib/types/funds"

export default function ManagerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [funds, setFunds] = useState<{ fund_id: string; fund_name: string; fund_type: FundType; manager_name: string; return_1y?: number | null; current_nav?: number | null; base_currency: string }[]>([])
  const [loading, setLoading] = useState(true)

  const managerName = slug ? getManagerNameFromSlug(slug) : null

  useEffect(() => {
    if (!slug) return
    async function load() {
      try {
        const res = await fetch("/api/v1/funds")
        const json = await res.json()
        const allFunds = mergeWithStaticFunds(json.data ?? [])
        const managerFunds = managerName
          ? allFunds.filter((f) => f.manager_name === managerName)
          : []
        setFunds(managerFunds)
      } catch {
        setFunds([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, managerName])

  if (!slug || (!loading && !managerName)) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-4 md:py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600">Manager not found.</p>
          <Link href="/funds" className="inline-flex items-center text-blue-600 font-medium mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Funds
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 md:pb-8">
      {/* Header: Back, manager name, X Funds - matches second screenshot */}
      <header className="bg-[#0a1628] text-white px-4 pt-6 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-white/80 hover:text-white text-sm font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">{managerName}</h1>
        <p className="text-white/70 text-sm mt-1">
          {funds.length} Fund{funds.length !== 1 ? "s" : ""}
        </p>
      </header>

      {/* Fund list: card per fund with colored dot, name, type, YTD (green), value, chevron */}
      <div className="px-4 -mt-2 max-w-2xl mx-auto space-y-2">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">Loading funds…</div>
        ) : funds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">No funds found for this manager.</div>
        ) : (
          funds.map((fund) => {
            const typeConfig = FUND_TYPE_CONFIG[fund.fund_type]
            return (
              <Link
                key={fund.fund_id}
                href={`/funds/${fund.fund_id}/overview`}
                className="flex items-center gap-3 px-4 py-4 bg-white rounded-xl shadow-sm hover:bg-gray-50/80 group"
              >
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${typeConfig?.color ?? "bg-gray-400"}`}
                  title={typeConfig?.label}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{fund.fund_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {typeConfig?.label ?? fund.fund_type}
                    {fund.return_1y != null && (
                      <span className={fund.return_1y >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {" · "}{fund.return_1y >= 0 ? "+" : ""}{fund.return_1y.toFixed(1)}% YTD
                      </span>
                    )}
                  </p>
                </div>
                {fund.current_nav != null && (
                  <p className="text-sm font-medium text-gray-700 shrink-0">
                    {fund.base_currency} {fund.current_nav.toLocaleString("en-TZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 shrink-0" />
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
