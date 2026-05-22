import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/experts/[expertId] — Get single expert profile
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ expertId: string }> }
) {
  const { expertId } = await params;

  try {
    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        courses: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            thumbnailUrl: true,
            category: true,
            level: true,
            price: true,
            currency: true,
            isFree: true,
            rating: true,
            totalEnrollments: true,
            totalLessons: true,
            totalDuration: true,
          },
        },
        availability: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
        _count: {
          select: {
            bookings: { where: { status: "COMPLETED" } },
          },
        },
      },
    });

    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    return NextResponse.json(expert);
  } catch (error) {
    console.error("GET /api/experts/[expertId] error:", error);
    return NextResponse.json({ error: "Failed to fetch expert" }, { status: 500 });
  }
}

/**
 * PATCH /api/experts/[expertId] — Update expert profile / approval status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ expertId: string }> }
) {
  const { expertId } = await params;

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Allow admin or the expert themselves
    const expert = await prisma.expertProfile.findUnique({ where: { id: expertId } });
    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    const isAdmin = user?.role === "ADMIN";
    const isOwnProfile = expert.userId === userId;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Only admin can change approval status
    if (body.approvalStatus && !isAdmin) {
      delete body.approvalStatus;
      delete body.approvalNote;
    }

    const updated = await prisma.expertProfile.update({
      where: { id: expertId },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/experts/[expertId] error:", error);
    return NextResponse.json({ error: "Failed to update expert" }, { status: 500 });
  }
}
