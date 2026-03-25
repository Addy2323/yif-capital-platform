import type { BulkGroupId } from "@/lib/bulk-sms-recipients"

export type { BulkGroupId }

export const GROUP_META: Record<
  BulkGroupId,
  { label: string; description: string; color: "sky" | "amber" | "emerald"; iconName: "Users" | "TrendingUp" | "Shield" }
> = {
  all_members: {
    label: "All Members",
    description: "Every registered user on the platform",
    color: "sky",
    iconName: "Users",
  },
  pro_investors: {
    label: "Pro Investors",
    description: "Users with active Pro Investor tier",
    color: "amber",
    iconName: "TrendingUp",
  },
  yif_team: {
    label: "YIF Team",
    description: "Internal YIF Capital team members",
    color: "emerald",
    iconName: "Shield",
  },
}

export type BulkSmsLogRow = {
  id: string
  message: string
  groupsTargeted: string[]
  recipientCount: number
  deliveredCount: number
  failedCount: number
  status: string
  scheduledAt: string | null
  sentAt: string | null
  estimatedCostTzs: number | null
  errorMessage: string | null
  createdAt: string
}

export type BulkSmsStats = {
  totalSmsSent: number
  totalRecipientsReached: number
  deliveryRatePct: number
  scheduledPending: number
}
