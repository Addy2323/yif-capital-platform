"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Layers, MapPin, Building2, List } from "lucide-react"
import type { Fund, PortfolioData, AllocationItem, HoldingItem } from "@/lib/types/funds"
import { BOND_FUND_TYPES, NO_SECTOR_ALLOCATION_TYPES, NO_MARKET_CAP_TYPES } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function PortfolioPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, portfolioRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/portfolio`),
        ])
        const fundResult = await fundRes.json()
        const portfolioResult = await portfolioRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (portfolioResult.success) setPortfolio(portfolioResult.data)
      } catch (err) {
        setError("Failed to load portfolio data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="portfolio" showTimeframeSelector={false}>
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  const fundType = fund?.fund_type as string
  const showSectorAllocation = !NO_SECTOR_ALLOCATION_TYPES.includes(fundType as any)
  const showMarketCap = !NO_MARKET_CAP_TYPES.includes(fundType as any)
  const isBondFund = BOND_FUND_TYPES.includes(fundType as any)

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="portfolio" isLoading={isLoading} showTimeframeSelector={false}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Holdings" value={portfolio?.total_holdings ?? 0} format="number" icon={<List className="w-4 h-4" />} />
          <KPICard label="Asset Classes" value={portfolio?.asset_allocation?.length ?? 0} format="number" icon={<Layers className="w-4 h-4" />} />
          {showSectorAllocation && (
            <KPICard label="Sectors" value={portfolio?.sector_allocation?.length ?? 0} format="number" icon={<Building2 className="w-4 h-4" />} />
          )}
          {portfolio?.geo_allocation && portfolio.geo_allocation.length > 0 && (
            <KPICard label="Countries" value={portfolio.geo_allocation.length} format="number" icon={<MapPin className="w-4 h-4" />} />
          )}
        </div>

        {/* Allocation Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Asset Allocation */}
          <Card className="border-border/50">
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="w-4 h-4" />Asset Allocation</CardTitle></CardHeader>
            <CardContent>
              {portfolio?.asset_allocation && portfolio.asset_allocation.length > 0 ? (
                <AllocationBar data={portfolio.asset_allocation} />
              ) : (
                <EmptyState title="No Asset Allocation" message="Asset allocation data is not available for this fund." />
              )}
            </CardContent>
          </Card>

          {/* Sector Allocation */}
          {showSectorAllocation && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4" />Sector Allocation</CardTitle></CardHeader>
              <CardContent>
                {portfolio?.sector_allocation && portfolio.sector_allocation.length > 0 ? (
                  <AllocationBar data={portfolio.sector_allocation} />
                ) : (
                  <EmptyState title="No Sector Allocation" message="Sector allocation data is not available for this fund." />
                )}
              </CardContent>
            </Card>
          )}

          {/* Geographic Allocation */}
          {portfolio?.geo_allocation && portfolio.geo_allocation.length > 0 && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-4 h-4" />Geographic Allocation</CardTitle></CardHeader>
              <CardContent>
                <AllocationBar data={portfolio.geo_allocation.map(g => ({ label: g.country, pct: g.pct }))} />
              </CardContent>
            </Card>
          )}

          {/* Market Cap Exposure */}
          {showMarketCap && portfolio?.market_cap_exposure && portfolio.market_cap_exposure.length > 0 && (
            <Card className="border-border/50">
              <CardHeader><CardTitle>Market Cap Exposure</CardTitle></CardHeader>
              <CardContent>
                <AllocationBar data={portfolio.market_cap_exposure} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Holdings Table */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Top Holdings</CardTitle></CardHeader>
          <CardContent>
            {portfolio?.top_holdings && portfolio.top_holdings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Asset Type</TableHead>
                    <TableHead className="text-right">Weight (%)</TableHead>
                    <TableHead className="text-right">Value (TZS)</TableHead>
                    <TableHead className="text-right">Change (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.top_holdings.slice(0, 10).map((holding, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{holding.name}</TableCell>
                      <TableCell className="text-muted-foreground">{holding.asset_type || '-'}</TableCell>
                      <TableCell className="text-right">{holding.weight_pct.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{holding.value ? holding.value.toLocaleString() : '-'}</TableCell>
                      <TableCell className={cn("text-right", holding.change_pct && holding.change_pct >= 0 ? "text-green-600" : "text-red-600")}>
                        {holding.change_pct ? `${holding.change_pct >= 0 ? '+' : ''}${holding.change_pct.toFixed(2)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No Holdings Data" message="Holdings data is not available for this fund." />
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}

// Allocation bar component
function AllocationBar({ data }: { data: AllocationItem[] }) {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500']

  return (
    <div className="space-y-4">
      {/* Stacked Bar */}
      <div className="h-8 rounded-lg overflow-hidden flex">
        {data.map((item, i) => (
          <div
            key={i}
            className={cn(colors[i % colors.length], "transition-all hover:opacity-80")}
            style={{ width: `${item.pct}%` }}
            title={`${item.label}: ${item.pct.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className={cn("w-3 h-3 rounded", colors[i % colors.length])} />
            <span className="truncate">{item.label}</span>
            <span className="text-muted-foreground ml-auto">{item.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
