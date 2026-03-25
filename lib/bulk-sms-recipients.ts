import { prisma } from "@/lib/prisma"

export const BULK_GROUP_IDS = ["all_members", "pro_investors", "yif_team"] as const
export type BulkGroupId = (typeof BULK_GROUP_IDS)[number]

export function isBulkGroupId(s: string): s is BulkGroupId {
  return (BULK_GROUP_IDS as readonly string[]).includes(s)
}

/** Normalize to unique E.164 strings */
export function dedupePhones(phones: (string | null | undefined)[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of phones) {
    if (!p || typeof p !== "string") continue
    const t = p.trim().replace(/\s/g, "")
    if (!t.startsWith("+") || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

async function phonesForGroup(group: BulkGroupId): Promise<string[]> {
  const notNull = { not: null } as const

  switch (group) {
    case "all_members": {
      const rows = await prisma.user.findMany({
        where: { phoneNumber: notNull, isVerified: true },
        select: { phoneNumber: true },
      })
      return dedupePhones(rows.map((r) => r.phoneNumber))
    }
    case "pro_investors": {
      const rows = await prisma.user.findMany({
        where: {
          phoneNumber: notNull,
          role: { in: ["PRO", "INSTITUTIONAL"] },
        },
        select: { phoneNumber: true },
      })
      return dedupePhones(rows.map((r) => r.phoneNumber))
    }
    case "yif_team": {
      const rows = await prisma.user.findMany({
        where: { phoneNumber: notNull, role: "ADMIN" },
        select: { phoneNumber: true },
      })
      return dedupePhones(rows.map((r) => r.phoneNumber))
    }
    default:
      return []
  }
}

/** Resolve and dedupe across selected groups (order preserved by first occurrence). */
export async function resolveRecipientPhones(groups: BulkGroupId[]): Promise<string[]> {
  const seen = new Set<string>()
  const out: string[] = []
  for (const g of groups) {
    const list = await phonesForGroup(g)
    for (const p of list) {
      if (seen.has(p)) continue
      seen.add(p)
      out.push(p)
    }
  }
  return out
}

export async function getGroupRecipientCounts(): Promise<Record<BulkGroupId, number>> {
  const notNull = { not: null } as const

  const [all_members, pro_investors, yif_team] = await Promise.all([
    prisma.user.count({ where: { phoneNumber: notNull, isVerified: true } }),
    prisma.user.count({
      where: {
        phoneNumber: notNull,
        role: { in: ["PRO", "INSTITUTIONAL"] },
      },
    }),
    prisma.user.count({ where: { phoneNumber: notNull, role: "ADMIN" } }),
  ])

  return { all_members, pro_investors, yif_team }
}
