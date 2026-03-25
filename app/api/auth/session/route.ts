import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { computeShouldShowPhonePrompt } from "@/lib/phone-prompt-config";

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

        const shouldPromptPhone = computeShouldShowPhonePrompt({
            role: user.role,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            lastPhonePromptDate: user.lastPhonePromptDate,
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase(),
                isVerified: user.isVerified,
                phoneNumber: user.phoneNumber,
                lastPhonePromptDate: user.lastPhonePromptDate
                    ? user.lastPhonePromptDate.toISOString().slice(0, 10)
                    : null,
                createdAt: user.createdAt.toISOString(),
                shouldPromptPhone,
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
