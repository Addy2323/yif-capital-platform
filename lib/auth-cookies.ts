import { cookies } from "next/headers"
import { createSession } from "./services/auth-service"

const WEEK_SEC = 60 * 60 * 24 * 7

export async function setAuthCookies(userId: string): Promise<void> {
  const cookieStore = await cookies()
  
  // Create a database-backed session
  const session = await createSession(userId)
  
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: WEEK_SEC,
    path: "/",
  }
  
  cookieStore.set("session_token", session.sessionToken, opts)
  cookieStore.set("user_id", userId, opts)
}
