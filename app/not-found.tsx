"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Search, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl w-full"
      >
        {/* Animated 404 Text */}
        <div className="relative inline-block mb-8">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            className="text-9xl md:text-[12rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 select-none"
          >
            404
          </motion.h1>
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -right-4 md:-top-8 md:-right-8"
          >
            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 opacity-50" />
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-4xl font-bold mb-4 tracking-tight"
        >
          Lost in the Market?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 text-lg mb-12 max-w-md mx-auto leading-relaxed"
        >
          The page you are looking for has been liquidated or moved to a different portfolio. Let's get you back to the green.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-none px-8 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </span>
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/5"
        >
          <p className="text-sm text-white/40 mb-4 uppercase tracking-widest font-semibold">Useful Links</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link href="/dashboard" className="text-white/60 hover:text-emerald-400 text-sm transition-colors">Dashboard</Link>
            <Link href="/experts" className="text-white/60 hover:text-emerald-400 text-sm transition-colors">Expert Advice</Link>
            <Link href="/funds" className="text-white/60 hover:text-emerald-400 text-sm transition-colors">Mutual Funds</Link>
            <Link href="/tools" className="text-white/60 hover:text-emerald-400 text-sm transition-colors">Financial Tools</Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Floating Numbers/Symbols */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-20 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-20%", "120%"],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 20
            }}
            className="absolute text-emerald-500 font-mono"
            style={{ fontSize: Math.random() * 20 + 10 + "px" }}
          >
            {["$", "%", "↑", "↓", "+", "-"][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
