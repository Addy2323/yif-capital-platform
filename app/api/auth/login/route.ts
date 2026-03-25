import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        if (!user.isVerified) {
            return NextResponse.json(
                {
                    error: "Please verify your phone number before signing in. Complete registration on the verification page.",
                    code: "PHONE_NOT_VERIFIED",
                },
                { status: 403 }
            );
        }

        await setAuthCookies(user.id);

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase(),
            isVerified: user.isVerified,
            phoneNumber: user.phoneNumber,
            lastPhonePromptDate: user.lastPhonePromptDate
                ? user.lastPhonePromptDate.toISOString().slice(0, 10)
                : null,
            createdAt: user.createdAt.toISOString()
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
