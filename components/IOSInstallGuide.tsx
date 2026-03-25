"use client"

/**
 * Animated step-by-step Add to Home Screen guide for iOS Safari.
 * Only meaningful on iOS; parent controls `open`. Optional dismiss memory via localStorage.
 */

import { motion, AnimatePresence } from "framer-motion"
import { Share2, PlusSquare, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { isIOSSafari, LS_IOS_GUIDE_DISMISSED } from "@/lib/pwa-utils"
import { useEffect, useState } from "react"

type IOSInstallGuideProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** If true, remember dismiss in localStorage (standalone component mode) */
  rememberDismiss?: boolean
}

const steps = [
  {
    title: "Tap Share",
    body: "Tap the Share button at the bottom of Safari (square with arrow).",
    icon: Share2,
  },
  {
    title: 'Add to Home Screen',
    body: 'Scroll the share sheet and tap "Add to Home Screen".',
    icon: PlusSquare,
  },
  {
    title: "Tap Add",
    body: 'Confirm with "Add" — the YIF Capital icon will appear on your home screen.',
    icon: CheckCircle2,
  },
]

export function IOSInstallGuide({ open, onOpenChange, rememberDismiss = false }: IOSInstallGuideProps) {
  const [step, setStep] = useState(0)
  const [isIosSafari, setIsIosSafari] = useState(false)

  useEffect(() => {
    setIsIosSafari(isIOSSafari())
  }, [])

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  const handleDismiss = () => {
    if (rememberDismiss) {
      try {
        window.localStorage.setItem(LS_IOS_GUIDE_DISMISSED, "1")
      } catch {
        /* ignore */
      }
    }
    onOpenChange(false)
  }

  const Icon = steps[step]?.icon ?? Share2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-gold/20 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">Install on iPhone & iPad</DialogTitle>
          <DialogDescription>
            {isIosSafari
              ? "Follow these steps in Safari to add YIF Capital to your home screen."
              : "On iPhone or iPad, open this site in Safari and follow the steps below."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-[200px] overflow-hidden rounded-xl bg-navy/5 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold"
              >
                <Icon className="h-9 w-9" aria-hidden />
              </motion.div>
              <div>
                <p className="text-lg font-semibold text-navy">
                  Step {step + 1}: {steps[step]?.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{steps[step]?.body}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to step ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? "bg-gold" : "bg-muted-foreground/30"
                }`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" className="bg-gold text-navy hover:bg-gold/90" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button type="button" className="bg-gold text-navy hover:bg-gold/90" onClick={handleDismiss}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Inline collapsible card for /download — only renders on iOS Safari */
export function IOSInstallGuideCard() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setDismissed(window.localStorage.getItem(LS_IOS_GUIDE_DISMISSED) === "1")
    } catch {
      setDismissed(false)
    }
  }, [])

  if (!mounted || dismissed || !isIOSSafari()) return null

  return (
    <>
      <Button type="button" variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Show iOS install steps
      </Button>
      <IOSInstallGuide open={open} onOpenChange={setOpen} rememberDismiss />
    </>
  )
}
