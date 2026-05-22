import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/lms/courses — List published courses (public)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const expertId = searchParams.get("expertId");
    const expertMode = searchParams.get("expertMode") === "true";

    // Expert mode: return all courses owned by the current expert (including drafts)
    if (expertMode) {
      const cookieStore = await cookies();
      const userId = cookieStore.get("user_id")?.value;
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { expertProfile: true },
      });
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      let expertProfile = user.expertProfile;
      if (!expertProfile && user.role === "EXPERT") {
        expertProfile = await prisma.expertProfile.create({ data: { userId: user.id } });
      }
      if (!expertProfile) {
        return NextResponse.json({ error: "Expert access required" }, { status: 403 });
      }

      const courses = await prisma.lmsCourse.findMany({
        where: { expertId: expertProfile.id },
        include: {
          expert: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(courses);
    }

    // Public mode: published courses only
    const where: any = { status: "PUBLISHED" };

    if (category) where.category = category;
    if (level) where.level = level;
    if (expertId) where.expertId = expertId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.lmsCourse.findMany({
      where,
      include: {
        expert: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/lms/courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

/**
 * POST /api/lms/courses — Expert creates a course
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { expertProfile: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let expertProfile = user.expertProfile;
    if (!expertProfile && user.role === "EXPERT") {
      expertProfile = await prisma.expertProfile.create({ data: { userId: user.id } });
    }
    if (!expertProfile && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Expert access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      price,
      isFree,
      thumbnailUrl,
      instructorPhotoUrl,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now().toString(36);

    const course = await prisma.lmsCourse.create({
      data: {
        expertId: expertProfile!.id,
        title,
        slug,
        description,
        shortDescription,
        category,
        level: level || "BEGINNER",
        price: price || 0,
        currency: "TZS",
        isFree: isFree || false,
        thumbnailUrl,
        instructorPhotoUrl,
        status: "DRAFT",
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/lms/courses error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to create course", detail }, { status: 500 });
  }
}
