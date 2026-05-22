import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 1 week

  return await prisma.userSession.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
      userAgent,
      ipAddress,
    },
  })
}

export async function validateSession(sessionToken: string) {
  const session = await prisma.userSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  })

  if (!session) return null

  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.userSession.delete({ where: { id: session.id } })
    return null
  }

  return session
}

export async function deleteSession(sessionToken: string) {
  try {
    await prisma.userSession.delete({
      where: { sessionToken },
    })
  } catch (error) {
    // Session might already be deleted
  }
}

export async function deleteAllUserSessions(userId: string) {
  await prisma.userSession.deleteMany({
    where: { userId },
  })
}
