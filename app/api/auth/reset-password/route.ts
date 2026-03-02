import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Hash the received token to compare with what's stored in DB
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find the reset record
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token: hashedToken },
        });

        if (!resetRecord) {
            return NextResponse.json(
                { error: "Invalid or expired reset link. Please request a new one." },
                { status: 400 }
            );
        }

        if (resetRecord.used) {
            return NextResponse.json(
                { error: "This reset link has already been used. Please request a new one." },
                { status: 400 }
            );
        }

        if (new Date() > resetRecord.expiresAt) {
            return NextResponse.json(
                { error: "This reset link has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update the user's password
        await prisma.user.update({
            where: { email: resetRecord.email },
            data: { password: hashedPassword },
        });

        // Mark the token as used
        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true },
        });

        return NextResponse.json({
            message: "Password has been reset successfully.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
