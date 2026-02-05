import { prisma } from "@/lib/prisma";
import { LiveSession } from "@prisma/client";

export const SessionService = {
    /**
     * Get all upcoming sessions for a specific course
     */
    async getUpcomingSessions(courseId: string): Promise<LiveSession[]> {
        return prisma.liveSession.findMany({
            where: {
                courseId,
                scheduledEnd: {
                    gt: new Date(),
                },
                status: {
                    not: "cancelled",
                },
            },
            orderBy: {
                scheduledStart: "asc",
            },
        });
    },

    /**
     * Check if a session is currently within its access window
     * (Standard: 30 minutes before start until session end)
     */
    isWithinAccessWindow(session: LiveSession): boolean {
        const now = new Date();
        const windowStart = new Date(session.scheduledStart.getTime() - 30 * 60 * 1000);
        const windowEnd = session.scheduledEnd;

        return now >= windowStart && now <= windowEnd;
    },

    /**
     * Get a session by ID and verify it's for the given course
     */
    async getSessionById(sessionId: string): Promise<LiveSession | null> {
        return prisma.liveSession.findUnique({
            where: { id: sessionId },
        });
    },

    /**
     * Admin: Create a new live session
     */
    async createSession(data: Omit<LiveSession, "id" | "status">): Promise<LiveSession> {
        return prisma.liveSession.create({
            data: {
                ...data,
                status: "scheduled",
            },
        });
    },

    /**
     * Update session status
     */
    async updateStatus(sessionId: string, status: "scheduled" | "live" | "ended" | "cancelled"): Promise<LiveSession> {
        return prisma.liveSession.update({
            where: { id: sessionId },
            data: { status },
        });
    }
};
