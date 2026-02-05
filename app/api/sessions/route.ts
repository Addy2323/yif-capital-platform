import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/services/session-service";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    try {
        const sessions = await prisma.liveSession.findMany({
            where: {
                ...(courseId ? { courseId } : {}),
                status: { not: "cancelled" },
                scheduledEnd: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Show last 24h as well
            },
            orderBy: {
                scheduledStart: "asc"
            }
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
