"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { e164FromTzLocalDigits, tzLocalDigitsFromPasteOrInput } from "@/lib/phone"
import { updateMyPhone, dismissPhonePrompt } from "@/lib/user-api"

type Props = {
  open: boolean
  onComplete: () => void
}

export function PhoneNumberPromptDialog({ open, onComplete }: Props) {
  const [localDigits, setLocalDigits] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [dismissLoading, setDismissLoading] = useState(false)

  const onDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    setLocalDigits(tzLocalDigitsFromPasteOrInput(e.target.value))
  }

  const handleSave = async () => {
    setError("")
    const e164 = e164FromTzLocalDigits(localDigits)
    if (!e164) {
      setError("Enter a valid Tanzania mobile number (9 digits starting with 6 or 7).")
      return
    }
    setLoading(true)
    try {
      const res = await updateMyPhone(e164)
      if (!res.success) {
        if (res.status === 409) {
          setError("This phone number is already registered to another account.")
        } else {
          setError(res.message || "Could not save phone number.")
        }
        return
      }
      toast.success("Phone number saved!")
      setLocalDigits("")
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  const handleRemindLater = async () => {
    setDismissLoading(true)
    try {
      await dismissPhonePrompt()
      onComplete()
    } finally {
      setDismissLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="border-amber-500/20 bg-card text-foreground sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please add your phone number to continue using all features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="phone-prompt" className="text-foreground">
              Phone number
            </Label>
            <div className="flex h-12 overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:ring-2 focus-within:ring-amber-400/40">
              <span
                className="inline-flex shrink-0 items-center border-r border-input bg-muted/60 px-3 text-sm font-medium tabular-nums"
                aria-hidden
              >
                +255
              </span>
              <Input
                id="phone-prompt"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="712 345 678"
                value={localDigits}
                onChange={onDigitsChange}
                className="h-12 flex-1 min-w-0 border-0 rounded-none shadow-none focus-visible:ring-0"
                disabled={loading || dismissLoading}
                maxLength={9}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            disabled={loading || dismissLoading}
            onClick={() => void handleSave()}
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Phone Number"}
          </Button>
          <button
            type="button"
            disabled={loading || dismissLoading}
            onClick={() => void handleRemindLater()}
            className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
          >
            {dismissLoading ? "Saving…" : "Remind me later"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
