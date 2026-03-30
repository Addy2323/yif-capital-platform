"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts"
import { 
  TrendingUp, 
  Calculator, 
  Coins, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  PieChart,
  ArrowRight,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

// Helper to format currency in TZS
const formatTZS = (val: number) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B TZS`
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M TZS`
  return `${val.toLocaleString()} TZS`
}

interface ProjectionPoint {
  year: number
  totalPrincipal: number
  totalDividends: number
  totalValue: number
}

export function DividendSnowballCalculator() {
  // Inputs
  const [initialInvestment, setInitialInvestment] = useState(5_000_000)
  const [monthlyContribution, setMonthlyContribution] = useState(500_000)
  const [dividendYield, setDividendYield] = useState(6.5) // Average DSE yield
  const [dividendGrowth, setDividendGrowth] = useState(5.0) // 5% growth per year
  const [years, setYears] = useState(20)
  const [reinvest, setReinvest] = useState(true)

  // AI State
  const [aiStrategy, setAiStrategy] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [recommendedStocks, setRecommendedStocks] = useState<any[]>([])

  // Calculation logic
  const projectionData = useMemo(() => {
    const data: ProjectionPoint[] = []
    let currentBalance = initialInvestment
    let totalInvested = initialInvestment
    let cumulativeDividends = 0
    let currentYield = dividendYield / 100

    for (let y = 0; y <= years; y++) {
      data.push({
        year: y,
        totalPrincipal: totalInvested,
        totalDividends: cumulativeDividends,
        totalValue: currentBalance,
      })

      // Monthly contributions and compounding
      for (let m = 0; m < 12; m++) {
        totalInvested += monthlyContribution
        currentBalance += monthlyContribution
        
        // Monthly portion of annual dividend
        const monthlyDividend = (currentBalance * currentYield) / 12
        cumulativeDividends += monthlyDividend
        
        if (reinvest) {
          currentBalance += monthlyDividend
        }
      }

      // Dividend growth (stocks often increase payouts)
      currentYield = currentYield * (1 + dividendGrowth / 100)
    }
    return data
  }, [initialInvestment, monthlyContribution, dividendYield, dividendGrowth, years, reinvest])

  const finalStats = projectionData[projectionData.length - 1]

  const fetchAiAdvice = async () => {
    setLoadingAi(true)
    try {
      const res = await fetch("/api/tools/dividend-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialInvestment,
          monthlyContribution,
          years,
          expectedYield: dividendYield,
          reinvest,
          totalValue: finalStats.totalValue,
          totalDividends: finalStats.totalDividends
        })
      })
      const data = await res.json()
      if (data.strategy) {
        setAiStrategy(data.strategy)
        setRecommendedStocks(data.recommendedStocks || [])
      }
    } catch (err) {
      console.error("Failed to get AI advice:", err)
    } finally {
      setLoadingAi(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Projection Inputs</h3>
            </div>

            <div className="space-y-6">
              {/* Initial Investment */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400">Initial Investment</label>
                  <span className="text-emerald-400 font-medium">{initialInvestment.toLocaleString()} TZS</span>
                </div>
                <input 
                  type="range" min="100000" max="50000000" step="100000"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Monthly Contribution */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400">Monthly Addition</label>
                  <span className="text-emerald-400 font-medium">{monthlyContribution.toLocaleString()} TZS</span>
                </div>
                <input 
                  type="range" min="0" max="5000000" step="50000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Dividend Yield */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Avg. Div. Yield (%)</label>
                  <input 
                    type="number" step="0.1"
                    value={dividendYield}
                    onChange={(e) => setDividendYield(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {/* Dividend Growth */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Payout Growth (%)</label>
                  <input 
                    type="number" step="0.1"
                    value={dividendGrowth}
                    onChange={(e) => setDividendGrowth(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Years */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400">Time Horizon</label>
                  <span className="text-emerald-400 font-medium">{years} Years</span>
                </div>
                <input 
                  type="range" min="1" max="40" step="1"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Reinvest Toggle */}
              <button 
                onClick={() => setReinvest(!reinvest)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                  reinvest 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                    : "bg-slate-800 border-slate-700 text-slate-400"
                )}
              >
                <div className="flex items-center gap-3 text-left">
                  <Coins className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">Reinvest Dividends</div>
                    <div className="text-xs opacity-70">Activate the snowball effect</div>
                  </div>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  reinvest ? "border-emerald-400 bg-emerald-400" : "border-slate-600"
                )}>
                  {reinvest && <ChevronRight className="h-3 w-3 text-emerald-950 font-bold" />}
                </div>
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <Sparkles className="absolute -right-4 -top-4 h-24 w-24 opacity-10 rotate-12" />
            <div className="relative z-10">
              <p className="text-emerald-100 text-sm font-medium mb-1">Projected Wealth</p>
              <h2 className="text-3xl font-bold mb-4">{formatTZS(finalStats.totalValue)}</h2>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                <div>
                  <p className="text-emerald-200 text-xs uppercase tracking-wider mb-1">Total Savings</p>
                  <p className="font-semibold">{formatTZS(finalStats.totalPrincipal)}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-xs uppercase tracking-wider mb-1">Stock Income</p>
                  <p className="font-semibold">{formatTZS(finalStats.totalDividends)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chart & AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Dividend Snowball Projection</h3>
              </div>
              <div className="bg-slate-800/50 rounded-full px-3 py-1 text-[10px] text-slate-400 uppercase tracking-tighter">
                {years} Year Compound Growth
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDiv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    label={{ value: 'Years', position: 'insideBottomRight', offset: -10, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => val >= 1_000_000 ? `${(val / 1_000_000).toFixed(0)}M` : val}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value: number) => [value.toLocaleString(), 'TZS']}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area 
                    name="Total Value (Stock + Cash)"
                    type="monotone" 
                    dataKey="totalValue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                  <Area 
                    name="Market Dividend Income"
                    type="monotone" 
                    dataKey="totalDividends" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDiv)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Strategist Section */}
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="bg-emerald-500/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white leading-none">YIF AI Strategist</h4>
                  <p className="text-[10px] text-emerald-400/70 font-medium tracking-widest uppercase mt-1">DSE Power Projections</p>
                </div>
              </div>
              
              {!aiStrategy && (
                <button 
                  onClick={fetchAiAdvice}
                  disabled={loadingAi}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-emerald-950 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                  {loadingAi ? (
                    <div className="h-4 w-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loadingAi ? "Analyzing..." : "Generate Strategy"}
                </button>
              )}
            </div>

            <div className="p-6">
              {aiStrategy ? (
                <div className="space-y-6">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
                    {aiStrategy.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  
                  {/* Recommended Stocks Display */}
                  {recommendedStocks.length > 0 && (
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                        <Coins className="h-4 w-4 text-gold" />
                        AI Recommended High-Yielders
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendedStocks.map((stock) => (
                          <div key={stock.symbol} className="bg-slate-800/50 rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all cursor-default group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{stock.symbol}</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                {stock.yield}% Yield
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mb-3">{stock.name}</p>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                              <span className="text-slate-500">Div. Growth</span>
                              <span className="text-emerald-400 font-medium">+{stock.growth || 0}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setAiStrategy(null)}
                    className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 rotate-180" />
                    Reset Strategy
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <PieChart className="h-12 w-12 text-slate-700 mx-auto" />
                  <div>
                    <p className="text-slate-400 text-sm">Need a custom DSE strategy?</p>
                    <p className="text-xs text-slate-500 mt-1">Adjust your inputs and let the AI analyze the potential.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Footer */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center text-slate-400 text-sm">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Info className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex-1 space-y-2">
          <h5 className="text-white font-semibold">How the Snowball Works</h5>
          <p>
            On the DSE, companies like <span className="text-white">CRDB</span>, <span className="text-white">TBL</span>, and <span className="text-white">NMB</span> often pay significant dividends. By reinvesting these (buying more shares with the payouts), you don't just earn interest on your principal—you earn dividends on your dividends. Over 10-20 years, this "snowball" can outpace your original contributions significantly.
          </p>
        </div>
      </div>
    </div>
  )
}
