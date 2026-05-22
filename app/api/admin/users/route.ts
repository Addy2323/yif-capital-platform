import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { z } from "zod";

const UserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string(),
});

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

export async function GET(req: NextRequest) {
    try {
        if (!(await isAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                role: true,
                createdAt: true,
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        completedAt: true
                    }
                }
            }
        });

        // Map database users to the frontend User interface
        const formattedUsers = users.map(user => {
            const lastPayment = user.payments[0];
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role.toLowerCase(),
                createdAt: user.createdAt.toISOString(),
                subscription: user.role === 'FREE' ? undefined : {
                    plan: user.role.toLowerCase() as "pro" | "institutional",
                    status: "active",
                    expiresAt: lastPayment?.completedAt?.toISOString() || undefined
                }
            };
        });

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!(await isAdmin(req))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = UserSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { name, email, password, role } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role.toUpperCase() as any,
                isVerified: true,
            }
        });

        return NextResponse.json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role.toLowerCase(),
            createdAt: newUser.createdAt.toISOString()
        });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
