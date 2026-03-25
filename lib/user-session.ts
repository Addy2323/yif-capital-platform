import { cookies } from "next/headers"

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("user_id")?.value ?? null
}
