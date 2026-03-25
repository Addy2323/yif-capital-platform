import { cookies } from "next/headers"

const WEEK_SEC = 60 * 60 * 24 * 7

export async function setAuthCookies(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = crypto.randomUUID()
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: WEEK_SEC,
    path: "/",
  }
  cookieStore.set("session_token", sessionToken, opts)
  cookieStore.set("user_id", userId, opts)
}
