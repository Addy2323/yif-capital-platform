import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

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
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
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
                role: user.role.toLowerCase(),
                createdAt: user.createdAt.toISOString(),
                subscription: user.role === 'FREE' ? undefined : {
                    plan: user.role.toLowerCase() as "pro" | "institutional",
                    status: "active", // In a real app, this would be determined by payment status and expiry
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

        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

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
                role: role.toUpperCase()
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
