"use client"

import { useAuth } from "@/lib/auth-context"
import { useShouldShowPhonePrompt } from "@/hooks/usePhonePrompt"
import { PhoneNumberPromptDialog } from "@/components/dialogs/PhoneNumberPromptDialog"

export function PhonePromptGate() {
  const { user, isLoading, refreshSession } = useAuth()
  const show = useShouldShowPhonePrompt(user)

  if (isLoading || !user) return null
  if (!show) return null

  return (
    <PhoneNumberPromptDialog
      open={show}
      onComplete={() => {
        void refreshSession()
      }}
    />
  )
}
