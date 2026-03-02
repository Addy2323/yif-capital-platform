import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin(req: NextRequest) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) return false;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    return user?.role === "ADMIN";
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        if (!(await isAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = params;
        const updates = await req.json();

        // Prepare data for Prisma, mapping role and subscription if necessary
        const data: any = {};
        if (updates.name) data.name = updates.name;
        if (updates.role) data.role = updates.role.toUpperCase();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data
        });

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role.toLowerCase(),
            createdAt: updatedUser.createdAt.toISOString()
        });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        if (!(await isAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = params;

        // Perform cascading deletes if necessary, or let Prisma handled it if configured
        // In our schema, we should check for related records

        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
