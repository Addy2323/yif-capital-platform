import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Always return success to prevent email enumeration
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (user) {
            // Invalidate any existing reset tokens for this email
            await prisma.passwordReset.updateMany({
                where: { email: normalizedEmail, used: false },
                data: { used: true },
            });

            // Generate a crypto-random token
            const rawToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto
                .createHash("sha256")
                .update(rawToken)
                .digest("hex");

            // Store the hashed token (expires in 1 hour)
            await prisma.passwordReset.create({
                data: {
                    email: normalizedEmail,
                    token: hashedToken,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                },
            });

            // Build reset URL with the RAW token (not the hash)
            const appUrl =
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

            // Send the email
            await sendPasswordResetEmail(normalizedEmail, resetUrl);
        }

        // Always return success
        return NextResponse.json({
            message:
                "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
