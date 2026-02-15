import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const sessions = await prisma.liveSession.findMany({
            include: {
                _count: {
                    select: { payments: true }
                }
            },
            orderBy: { scheduledStart: "desc" }
        });
        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Creating session with body:", JSON.stringify(body, null, 2));

        const scheduledStart = new Date(body.scheduledStart);
        const scheduledEnd = new Date(body.scheduledEnd);

        if (isNaN(scheduledStart.getTime()) || isNaN(scheduledEnd.getTime())) {
            return NextResponse.json({
                error: "Invalid date format",
                details: `Start: ${body.scheduledStart}, End: ${body.scheduledEnd}`
            }, { status: 400 });
        }

        console.log("Parsed dates:", {
            incomingStart: body.scheduledStart,
            incomingEnd: body.scheduledEnd,
            parsedStart: scheduledStart.toISOString(),
            parsedEnd: scheduledEnd.toISOString()
        });

        const session = await prisma.liveSession.create({
            data: {
                title: body.title,
                shortDescription: body.shortDescription,
                description: body.description,
                courseId: body.courseId,
                meetingUrl: body.meetingUrl,
                recordingUrl: body.recordingUrl || null,
                scheduledStart: scheduledStart,
                scheduledEnd: scheduledEnd,
                status: "scheduled",
                price: Number(body.price) || 0,
                currency: body.currency || "TZS",
                isFree: body.isFree === undefined ? true : body.isFree
            }
        });
        console.log("Session created:", session);
        return NextResponse.json(session);
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({
            error: "Failed to create session",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}