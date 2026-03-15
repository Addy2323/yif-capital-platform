import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const count = await prisma.user.count();
        return NextResponse.json({ status: "ok", type: "GET", count });
    } catch (error) {
        return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const count = await prisma.user.count();
        return NextResponse.json({ status: "ok", type: "POST", count });
    } catch (error) {
        console.error("Test Route Error:", error);
        return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
