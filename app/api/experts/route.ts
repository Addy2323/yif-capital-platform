import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/experts — List all approved experts (public)
 * Supports ?category=STOCK_MARKET&search=name
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {
      approvalStatus: "APPROVED",
    };

    if (category) {
      where.specializations = { has: category };
    }

    if (search) {
      where.user = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const experts = await prisma.expertProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            courses: { where: { status: "PUBLISHED" } },
            bookings: { where: { status: "COMPLETED" } },
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    return NextResponse.json(experts);
  } catch (error) {
    console.error("GET /api/experts error:", error);
    return NextResponse.json({ error: "Failed to fetch experts" }, { status: 500 });
  }
}

/**
 * POST /api/experts — Admin creates an expert profile
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const {
      targetUserId,
      bio,
      headline,
      experienceYears,
      specializations,
      hourlyRate,
      location,
      isAvailableOnline,
      isAvailablePhysical,
      physicalAddress,
    } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    // Update user role to EXPERT
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: "EXPERT" },
    });

    // Create expert profile
    const expert = await prisma.expertProfile.upsert({
      where: { userId: targetUserId },
      update: {
        bio,
        headline,
        experienceYears: experienceYears || 0,
        specializations: specializations || [],
        hourlyRate: hourlyRate || 0,
        location,
        isAvailableOnline: isAvailableOnline ?? true,
        isAvailablePhysical: isAvailablePhysical ?? false,
        physicalAddress,
        approvalStatus: "APPROVED",
      },
      create: {
        userId: targetUserId,
        bio,
        headline,
        experienceYears: experienceYears || 0,
        specializations: specializations || [],
        hourlyRate: hourlyRate || 0,
        location,
        isAvailableOnline: isAvailableOnline ?? true,
        isAvailablePhysical: isAvailablePhysical ?? false,
        physicalAddress,
        approvalStatus: "APPROVED",
      },
    });

    return NextResponse.json(expert, { status: 201 });
  } catch (error) {
    console.error("POST /api/experts error:", error);
    return NextResponse.json({ error: "Failed to create expert" }, { status: 500 });
  }
}
