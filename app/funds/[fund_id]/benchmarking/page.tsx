"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Target, TrendingUp, Activity, Users } from "lucide-react"
import type { Fund, BenchmarkingData, Timeframe } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function BenchmarkingPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [benchmarking, setBenchmarking] = useState<BenchmarkingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, benchRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/benchmarking?timeframe=${timeframe}`),
        ])
        const fundResult = await fundRes.json()
        const benchResult = await benchRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (benchResult.success) setBenchmarking(benchResult.data)
      } catch (err) {
        setError("Failed to load benchmarking data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId, timeframe])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="benchmarking">
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="benchmarking" isLoading={isLoading} timeframe={timeframe} onTimeframeChange={setTimeframe}>
      <div className="space-y-6">
        {/* Benchmark Comparison KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Fund Return" value={benchmarking?.fund_return} format="percent" icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="Benchmark Return" value={benchmarking?.benchmark_return} format="percent" icon={<BarChart3 className="w-4 h-4" />} />
          <KPICard label="Alpha" value={benchmarking?.alpha} format="ratio" icon={<Target className="w-4 h-4" />} />
          <KPICard label="Beta" value={benchmarking?.beta} format="ratio" icon={<Activity className="w-4 h-4" />} />
        </div>

        {/* Second Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Tracking Error" value={benchmarking?.tracking_error} format="percent" icon={<Activity className="w-4 h-4" />} />
          <KPICard label="Information Ratio" value={benchmarking?.information_ratio} format="ratio" icon={<Target className="w-4 h-4" />} />
          {benchmarking?.rank_percentile != null && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground mb-1">Percentile Rank</p>
                <p className="text-2xl font-bold">{benchmarking.rank_percentile}th</p>
                <p className="text-xs text-muted-foreground">among peer funds</p>
              </CardContent>
            </Card>
          )}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-1">Benchmark</p>
              <p className="text-lg font-bold truncate">{benchmarking?.benchmark_name || 'Not configured'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Radar Chart Placeholder */}
        {benchmarking?.radar_axes && benchmarking.radar_axes.length > 0 && (
          <Card className="border-border/50">
            <CardHeader><CardTitle>Fund vs Benchmark Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {benchmarking.radar_axes.map((axis, i) => (
                  <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">{axis.axis_label}</p>
                    <div className="flex justify-center gap-4">
                      <div>
                        <p className="text-lg font-bold text-primary">{axis.fund_score.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Fund</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-400">{axis.benchmark_score.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Bench</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Peer Comparison Table */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" />Peer Comparison</CardTitle></CardHeader>
          <CardContent>
            {benchmarking?.peers && benchmarking.peers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Fund Name</TableHead>
                    <TableHead className="text-right">Return (%)</TableHead>
                    <TableHead className="text-right">Volatility (%)</TableHead>
                    <TableHead className="text-right">Sharpe</TableHead>
                    <TableHead className="text-right">Max DD (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarking.peers.map((peer, i) => (
                    <TableRow key={`${peer.fund_id}-${peer.fund_name}`} className={peer.fund_id === fundId ? 'bg-primary/5' : ''}>
                      <TableCell>{peer.rank}</TableCell>
                      <TableCell className="font-medium">{peer.fund_name}</TableCell>
                      <TableCell className={cn("text-right", peer.return_pct >= 0 ? "text-green-600" : "text-red-600")}>
                        {peer.return_pct >= 0 ? '+' : ''}{peer.return_pct.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">{peer.volatility.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{peer.sharpe_ratio.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-red-600">-{peer.max_drawdown.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No Peer Data" message="Peer comparison data is not available for this fund type." />
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}
