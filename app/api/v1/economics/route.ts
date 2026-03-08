import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/economics — Get all economic indicators
export async function GET() {
    try {
        const indicators = await prisma.economicIndicator.findMany({
            orderBy: { sortOrder: "asc" },
        })

        return NextResponse.json({
            success: true,
            data: indicators,
        })
    } catch (error: any) {
        console.error("[ECONOMICS API] Error fetching indicators:", error)
        return NextResponse.json(
            { success: false, data: null, error: error.message },
            { status: 500 }
        )
    }
}

// POST /api/v1/economics — Create or Update an indicator (Admin only ideally, but we'll handle auth in the route if needed)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, title, value, label, change, previousValue, sortOrder } = body

        if (!title || !value) {
            return NextResponse.json(
                { success: false, error: "Title and Value are required" },
                { status: 400 }
            )
        }

        let indicator
        if (id) {
            // Update existing
            indicator = await prisma.economicIndicator.update({
                where: { id },
                data: { title, value, label, change, previousValue, sortOrder: sortOrder || 0 },
            })
        } else {
            // Create new
            indicator = await prisma.economicIndicator.upsert({
                where: { title },
                update: { value, label, change, previousValue, sortOrder: sortOrder || 0 },
                create: { title, value, label, change, previousValue, sortOrder: sortOrder || 0 },
            })
        }

        return NextResponse.json({
            success: true,
            data: indicator,
        })
    } catch (error: any) {
        console.error("[ECONOMICS API] Error saving indicator:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/economics?id=xxx
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { success: false, error: "ID is required" },
                { status: 400 }
            )
        }

        await prisma.economicIndicator.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: "Indicator deleted successfully",
        })
    } catch (error: any) {
        console.error("[ECONOMICS API] Error deleting indicator:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
