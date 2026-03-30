"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  Swords, 
  Shield, 
  TrendingUp, 
  Coins, 
  Search, 
  ChevronDown, 
  AlertCircle,
  Trophy,
  RefreshCcw,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Stock {
  symbol: string
  name: string
  price: number
  dividend_yield?: number
  pe_ratio?: number
  change_1y?: number
  sector: string
}

export function StockClash() {
  const [stocks, setStocks] = useState<{symbol: string, name: string}[]>([])
  const [selectionA, setSelectionA] = useState<string>("")
  const [selectionB, setSelectionB] = useState<string>("")
  const [duelResult, setDuelResult] = useState<{
    verdict: string
    stockA: Stock
    stockB: Stock
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/stocks/list")
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(err => console.error("Failed to load stocks", err))
  }, [])

  const startDuel = async () => {
    if (!selectionA || !selectionB) return
    if (selectionA === selectionB) {
      setError("Cannot duel a stock against itself!")
      return
    }
    
    setLoading(true)
    setError(null)
    setDuelResult(null)

    try {
      const res = await fetch("/api/tools/stock-duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbolA: selectionA, symbolB: selectionB })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDuelResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const StatRow = ({ label, valA, valB, suffix = "", higherIsBetter = true }: any) => {
    const isABetter = higherIsBetter ? (valA > valB) : (valA < valB)
    const isBBetter = higherIsBetter ? (valB > valA) : (valB < valA)
    
    return (
      <div className="py-4 border-b border-white/5 last:border-0">
        <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">{label}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className={cn(
            "text-right transition-all duration-500",
            isABetter ? "text-emerald-400 font-bold scale-110" : "text-slate-400"
          )}>
            {valA === null || valA === undefined ? "N/A" : `${valA}${suffix}`}
          </div>
          <div className={cn(
            "text-left transition-all duration-500",
            isBBetter ? "text-emerald-400 font-bold scale-110" : "text-slate-400"
          )}>
            {valB === null || valB === undefined ? "N/A" : `${valB}${suffix}`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Duel Setup */}
      {!duelResult && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-8"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20 text-gold mb-4">
            <Swords className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Enter the Arena</h2>
            <p className="text-slate-400 text-sm">Select two Tanzanian stocks to begin the ultimate comparison.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-left">Fighter A</label>
              <div className="relative">
                <select 
                  value={selectionA}
                  onChange={(e) => setSelectionA(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-4 text-white appearance-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select Stock...</option>
                  {stocks.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-left">Fighter B</label>
              <div className="relative">
                <select 
                  value={selectionB}
                  onChange={(e) => setSelectionB(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-4 text-white appearance-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Stock...</option>
                  {stocks.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg justify-center max-w-sm mx-auto">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button 
            onClick={startDuel}
            disabled={!selectionA || !selectionB}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-800 text-emerald-950 font-black px-12 py-5 rounded-2xl transition-all shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:scale-100 uppercase tracking-widest"
          >
            Start The Duel
            <Zap className="h-5 w-5 group-hover:animate-pulse" />
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="inline-block"
          >
            <Swords className="h-16 w-16 text-emerald-500" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Analyzing Markets...</h3>
            <p className="text-slate-400 animate-pulse">The AI Referee is reviewing the stats.</p>
          </div>
        </div>
      )}

      {/* Duel Result */}
      <AnimatePresence>
        {duelResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* The Stage */}
            <div className="relative overflow-hidden bg-slate-900 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              
              {/* Header: VS */}
              <div className="relative z-10 flex items-center justify-between gap-4 mb-12">
                <div className="text-center flex-1">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Challenger A</div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{duelResult.stockA.symbol}</h2>
                  <p className="text-slate-500 text-xs truncate max-w-[150px] mx-auto mt-1">{duelResult.stockA.name}</p>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-red-600/30">VS</div>
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                <div className="text-center flex-1">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Challenger B</div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{duelResult.stockB.symbol}</h2>
                  <p className="text-slate-500 text-xs truncate max-w-[150px] mx-auto mt-1">{duelResult.stockB.name}</p>
                </div>
              </div>

              {/* Comparisons */}
              <div className="relative z-10 max-w-xl mx-auto bg-black/20 rounded-2xl border border-white/5 p-6 shadow-inner">
                <StatRow label="Current Price" valA={duelResult.stockA.price} valB={duelResult.stockB.price} suffix=" TZS" higherIsBetter={false} />
                <StatRow label="Dividend Yield" valA={duelResult.stockA.dividend_yield} valB={duelResult.stockB.dividend_yield} suffix="%" />
                <StatRow label="Price Change (1Y)" valA={duelResult.stockA.change_1y} valB={duelResult.stockB.change_1y} suffix="%" />
                <StatRow label="P/E Ratio" valA={duelResult.stockA.pe_ratio} valB={duelResult.stockB.pe_ratio} higherIsBetter={false} />
              </div>
              
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setDuelResult(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <RefreshCcw className="h-3 w-3" />
                  New Battle
                </button>
              </div>
            </div>

            {/* AI Verdict */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900 border-2 border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-emerald-500/10 px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-emerald-950 shadow-lg shadow-emerald-500/20">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase tracking-tight">The Referee's Match Report</h4>
                    <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase opacity-70">Gemini AI Verdict</p>
                  </div>
                </div>
                <Sparkles className="h-6 w-6 text-emerald-400/50" />
              </div>

              <div className="p-8 lg:p-10 space-y-8">
                <div className="prose prose-invert prose-sm max-w-none">
                  {duelResult.verdict.split(/\d\./).filter(Boolean).map((section, idx) => {
                    const titles = ["Income Prospect", "Growth Candidate", "Final Verdict"]
                    return (
                      <div key={idx} className="mb-8 last:mb-0 space-y-3">
                        <div className="flex items-center gap-2 text-gold font-bold uppercase text-[10px] tracking-widest">
                          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                          {titles[idx]}
                        </div>
                        <p className="text-slate-300 leading-relaxed text-base italic">{section.trim()}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                   <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                     <AlertCircle className="h-4 w-4" />
                     Strategy Advice
                   </div>
                   <p className="text-slate-400 text-sm italic py-1 border-l-2 border-emerald-500 pl-4">
                    "On the DSE, market depth varies significantly. While {duelResult.stockA.symbol} and {duelResult.stockB.symbol} show different strengths, always prioritize liquidity when taking a large position."
                   </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
