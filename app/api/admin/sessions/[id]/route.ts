import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        console.log(`[PATCH /api/admin/sessions/${id}] Received body:`, JSON.stringify(body, null, 2));

        const scheduledStart = body.scheduledStart ? new Date(body.scheduledStart) : undefined;
        const scheduledEnd = body.scheduledEnd ? new Date(body.scheduledEnd) : undefined;

        if (scheduledStart && isNaN(scheduledStart.getTime())) {
            console.error("Invalid scheduledStart:", body.scheduledStart);
            return NextResponse.json({ error: "Invalid start date format" }, { status: 400 });
        }
        if (scheduledEnd && isNaN(scheduledEnd.getTime())) {
            console.error("Invalid scheduledEnd:", body.scheduledEnd);
            return NextResponse.json({ error: "Invalid end date format" }, { status: 400 });
        }

        console.log("Updating session with data:", {
            title: body.title,
            incomingStart: body.scheduledStart,
            incomingEnd: body.scheduledEnd,
            parsedStart: scheduledStart?.toISOString(),
            parsedEnd: scheduledEnd?.toISOString(),
            status: body.status
        });

        const session = await prisma.liveSession.update({
            where: { id },
            data: {
                title: body.title,
                shortDescription: body.shortDescription,
                description: body.description,
                courseId: body.courseId,
                meetingUrl: body.meetingUrl,
                scheduledStart: scheduledStart,
                scheduledEnd: scheduledEnd,
                status: body.status,
                price: body.price !== undefined ? Number(body.price) : undefined,
                currency: body.currency,
                isFree: body.isFree
            }
        });

        console.log("Session updated successfully:", session.id);
        return NextResponse.json(session);
    } catch (error) {
        console.error("Failed to update session:", error);
        return NextResponse.json({
            error: "Failed to update session",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.liveSession.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete session:", error);
        return NextResponse.json({
            error: "Failed to delete session",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
