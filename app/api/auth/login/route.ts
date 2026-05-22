import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookies } from "@/lib/auth-cookies";
import { computeShouldShowPhonePrompt } from "@/lib/phone-prompt-config";

import { z } from "zod";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = LoginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { email, password } = result.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Check for account lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const timeLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000 / 60);
            return NextResponse.json({ 
                error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${timeLeft} minutes.`,
                code: "ACCOUNT_LOCKED"
            }, { status: 403 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            // Increment failed attempts
            const newFailedAttempts = user.failedLoginAttempts + 1;
            const lockoutUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: newFailedAttempts,
                    lockoutUntil: lockoutUntil
                }
            });

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

        // Reset failed attempts on success
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockoutUntil: null
            }
        });

        await setAuthCookies(user.id);

        const shouldPromptPhone = computeShouldShowPhonePrompt({
            role: user.role,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            lastPhonePromptDate: user.lastPhonePromptDate,
        });

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
            createdAt: user.createdAt.toISOString(),
            shouldPromptPhone,
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
