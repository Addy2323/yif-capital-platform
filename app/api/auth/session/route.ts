import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json({ user: null });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase(),
                createdAt: user.createdAt.toISOString()
            }
        });

    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json({ user: null });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("session_token");
        cookieStore.delete("user_id");

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}
