import { DividendSnowballCalculator } from "@/components/tools/dividend-snowball-calculator"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Globe2,
  GeminiIcon
} from "lucide-react"

export const metadata = {
  title: "DSE Dividend Snowball | YIF Capital",
  description: "Calculate your future wealth on the Dar es Salaam Stock Exchange using our AI-powered dividend reinvestment strategist.",
}

export default function DividendSnowballPage() {
  return (
    <div className="flex min-h-screen bg-navy text-slate-200">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-white/5 p-8 lg:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="h-48 w-48 text-emerald-400 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                Premium Investment Tools
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                DSE Dividend <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Snowball</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Unlock the power of compounding on the Dar es Salaam Stock Exchange. 
                Visualize your path to financial freedom and let <span className="text-white font-semibold">Gemini AI</span> 
                craft a custom reinvestment strategy based on real-time DSE data.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 text-sm border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Verified DSE Data
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 text-sm border border-white/10">
                  <Globe2 className="h-4 w-4 text-blue-400" />
                  Tanzanian Market Focus
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Section */}
          <DividendSnowballCalculator />

          {/* Bottom Call to Action or Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-xl font-bold text-white">Why Dividend Reinvestment?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                When you reinvest dividends, you're using wealth to generate more wealth. 
                Historically, dividends have accounted for a significant portion of total returns 
                on the DSE, especially from "Blue Chip" companies with strong payout histories.
              </p>
            </div>
            <div className="bg-gradient-to-br from-navy to-slate-900 p-8 rounded-3xl border border-emerald-500/10 space-y-4 relative group overflow-hidden">
               <div className="absolute inset-0 bg-emerald-500/5 transition-opacity opacity-0 group-hover:opacity-100" />
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-emerald-400" />
                 AI-Driven Insights
               </h3>
               <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                 Our native Gemini integration analyzes dividend yields, payout ratios, 
                 and historical growth from our daily web-scrapes to identify the 
                 best "Snowball Stocks" for your specific investment horizon.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
