import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

/** Returns user id if current session is an admin, else null */
export async function getAdminUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role !== "ADMIN") return null
  return userId
}
