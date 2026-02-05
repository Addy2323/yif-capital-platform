import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const SUBDOMAIN_URL = process.env.NEXT_PUBLIC_SUBDOMAIN_URL || "https://meet.yifcapital.co.tz";

/**
 * Generate a secure, single-use access token for a live session
 * Simplified version that avoids service calls that might fail
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    const sessionId = params.sessionId;

    // Get userId from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // 1. Basic Validation
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", code: "NOT_LOGGED_IN" }, { status: 401 });
    }

    try {
        // Verify user exists in database
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Fetch Session directly
        const session = await prisma.liveSession.findUnique({ where: { id: sessionId } });
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // 3. For paid sessions, check access permission
        if (!session.isFree) {
            // PRO and INSTITUTIONAL users have access to all sessions
            if (user.role === "PRO" || user.role === "INSTITUTIONAL" || user.role === "ADMIN") {
                // Allowed - they have subscription access
            } else {
                // Check for session-specific payment
                const sessionPayment = await prisma.payment.findFirst({
                    where: {
                        userId,
                        sessionId: session.id,
                        status: "success"
                    }
                });

                if (!sessionPayment) {
                    // Also check enrollment
                    const enrollment = await prisma.enrollment.findFirst({
                        where: {
                            userId,
                            courseId: session.courseId,
                            status: "ACTIVE"
                        }
                    });

                    if (!enrollment) {
                        return NextResponse.json({
                            error: "Payment required",
                            code: "SESSION_PAYMENT_REQUIRED",
                            price: session.price,
                            currency: session.currency,
                            message: `This session requires a one-time payment of ${session.currency} ${session.price.toLocaleString()}`
                        }, { status: 403 });
                    }
                }
            }
        }

        // 4. Check Access Window (30 min before until end)
        const now = new Date();
        const windowStart = new Date(session.scheduledStart.getTime() - 30 * 60 * 1000);
        const windowEnd = session.scheduledEnd;

        if (now < windowStart || now > windowEnd) {
            return NextResponse.json({
                error: "Access closed",
                message: "Access opens 30 minutes before the start time"
            }, { status: 403 });
        }

        // 5. Generate simple token (skip complex TokenService for now)
        const simpleToken = Buffer.from(JSON.stringify({
            userId,
            sessionId,
            exp: Date.now() + 90 * 60 * 1000
        })).toString('base64');

        // 6. Return Redirect URL
        const redirectUrl = session.meetingUrl || `${SUBDOMAIN_URL}/join?token=${simpleToken}`;
        return NextResponse.json({ redirectUrl });

    } catch (error: any) {
        console.error("[Access Route] ERROR:", error.message, error.stack);
        return NextResponse.json({
            error: "Internal server error",
            details: error.message
        }, { status: 500 });
    }
}
