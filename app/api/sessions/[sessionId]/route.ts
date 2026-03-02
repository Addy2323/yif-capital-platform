import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get session details by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const session = await prisma.liveSession.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                title: true,
                description: true,
                scheduledStart: true,
                scheduledEnd: true,
                status: true,
                price: true,
                currency: true,
                isFree: true,
                courseId: true
            }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json(session);

    } catch (error) {
        console.error("Get Session Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
