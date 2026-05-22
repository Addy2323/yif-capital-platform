import { cookies } from "next/headers"
import { validateSession } from "./services/auth-service"

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  
  if (!sessionToken) return null
  
  const session = await validateSession(sessionToken)
  
  if (!session) {
    // Session is invalid or expired, clear cookies
    cookieStore.delete("session_token")
    cookieStore.delete("user_id")
    return null
  }
  
  return session.userId
}
