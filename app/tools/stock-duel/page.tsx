import { StockClash } from "@/components/tools/stock-clash"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { 
  Swords, 
  Sparkles, 
  Zodiac,
  Skull,
  Zap,
  ShieldCheck,
  Globe2
} from "lucide-react"

export const metadata = {
  title: "DSE Stock Clash | YIF Capital",
  description: "Pit two Tanzanian stocks against each other in the ultimate AI-powered duel.",
}

export default function StockClashPage() {
  return (
    <div className="flex min-h-screen bg-navy text-slate-200">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Hero: The Arena */}
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-white/5 p-10 lg:p-16 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Swords className="h-64 w-64 text-emerald-400 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-6 max-w-3xl">
              <div className="flex items-center gap-2 text-gold font-black text-xs uppercase tracking-[0.4em]">
                <Sparkles className="h-4 w-4" />
                DSE Combat Arena
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                STOCK <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 italic">CLASH</span>
              </h1>
              <p className="text-slate-400 text-xl leading-relaxed font-medium">
                The ultimate head-to-head comparison tool for Tanzanian investors. 
                Pick your fighters and let our <span className="text-white font-bold">Gemini AI Referee</span> 
                declare the winner based on current market strength.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-2xl px-5 py-2.5 text-sm font-bold border border-white/10 text-slate-300">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Real-Time Stats
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-2xl px-5 py-2.5 text-sm font-bold border border-white/10 text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  AI Verified Verdicts
                </div>
              </div>
            </div>
          </div>

          {/* Arena Component */}
          <StockClash />

          {/* Footer: How to use */}
          <div className="grid md:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-widest">Phase 1: Stats</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                We compare Dividend Yield, P/E Ratio, and 1-Year performance directly from the latest DSE daily scrapes.
              </p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                <Globe2 className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-widest">Phase 2: Context</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                The Gemini AI analyzes market sentiment and sector volatility to find the hidden winner.
              </p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-widest">Phase 3: Victory</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Get a definitive verdict on which stock is the "Income Champion" or "Growth Warrior".
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
