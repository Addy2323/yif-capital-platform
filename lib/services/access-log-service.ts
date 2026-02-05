import { prisma } from "@/lib/prisma";

export interface LogEntry {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
    userAgent?: string;
    status: 'success' | 'denied';
    reason?: string;
}

export const AccessLogService = {
    /**
     * Log an access attempt
     */
    async logAttempt(entry: LogEntry): Promise<void> {
        try {
            await prisma.accessAttemptLog.create({
                data: entry,
            });
        } catch (error) {
            console.error("Failed to log access attempt:", error);
        }
    },

    /**
     * Get recent access logs for a specific session
     */
    async getSessionLogs(sessionId: string, limit: number = 100) {
        return prisma.accessAttemptLog.findMany({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    },

    /**
     * Check for potential abuse (e.g., many denied attempts for a user)
     */
    async checkAbuse(userId: string, minutes: number = 60): Promise<boolean> {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        const deniedCount = await prisma.accessAttemptLog.count({
            where: {
                userId,
                status: "denied",
                createdAt: { gt: cutoff },
            },
        });

        return deniedCount > 10; // Threshold for suspicious activity
    }
};
