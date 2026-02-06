import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await req.json();

        const scheduledStart = body.scheduledStart ? new Date(body.scheduledStart) : undefined;
        const scheduledEnd = body.scheduledEnd ? new Date(body.scheduledEnd) : undefined;

        if (scheduledStart && isNaN(scheduledStart.getTime())) {
            return NextResponse.json({ error: "Invalid start date format" }, { status: 400 });
        }
        if (scheduledEnd && isNaN(scheduledEnd.getTime())) {
            return NextResponse.json({ error: "Invalid end date format" }, { status: 400 });
        }

        const session = await prisma.liveSession.update({
            where: { id },
            data: {
                title: body.title,
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
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
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
