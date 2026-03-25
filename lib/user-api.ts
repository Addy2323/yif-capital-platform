export async function updateMyPhone(phoneE164: string): Promise<{
  success: boolean
  message?: string
  status: number
}> {
  const res = await fetch("/api/users/me/phone", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneE164 }),
  })
  const data = (await res.json()) as { success?: boolean; message?: string }
  return {
    success: Boolean(data.success),
    message: data.message,
    status: res.status,
  }
}

export async function dismissPhonePrompt(): Promise<{
  success: boolean
  last_phone_prompt_date?: string
}> {
  const res = await fetch("/api/users/me/phone-prompt-dismissed", { method: "PATCH" })
  return (await res.json()) as { success: boolean; last_phone_prompt_date?: string }
}

export async function adminUpdateUserPhone(
  userId: string,
  phoneE164: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/admin/users/${userId}/phone`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneE164 }),
  })
  const data = (await res.json()) as { success?: boolean; message?: string }
  return { success: res.ok && Boolean(data.success), message: data.message }
}
