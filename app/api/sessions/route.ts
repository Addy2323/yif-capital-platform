import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/services/session-service";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        // Get user for role check if logged in
        const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

        const sessions = await prisma.liveSession.findMany({
            where: {
                ...(courseId ? { courseId } : {}),
                status: { not: "cancelled" },
            },
            orderBy: {
                scheduledStart: "asc"
            }
        });

        // Enrich sessions with access status
        const enrichedSessions = await Promise.all(sessions.map(async (session) => {
            let hasAccess = false;

            if (session.isFree) {
                hasAccess = true;
            } else if (user) {
                // Admins, Pro, and Institutional users have access to all sessions
                if (user.role === "ADMIN" || user.role === "PRO" || user.role === "INSTITUTIONAL") {
                    hasAccess = true;
                } else {
                    // Check for session-specific payment
                    const payment = await prisma.payment.findFirst({
                        where: {
                            userId: user.id,
                            sessionId: session.id,
                            status: "success"
                        }
                    });

                    if (payment) {
                        hasAccess = true;
                    } else {
                        // Check for course enrollment
                        const enrollment = await prisma.enrollment.findFirst({
                            where: {
                                userId: user.id,
                                courseId: session.courseId,
                                status: "ACTIVE"
                            }
                        });
                        if (enrollment) hasAccess = true;
                    }
                }
            }

            return {
                ...session,
                hasAccess
            };
        }));

        return NextResponse.json(enrichedSessions);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
