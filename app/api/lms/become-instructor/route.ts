import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { sendGeneralSms } from "@/lib/sms"

// Helper to format TZ numbers
function formatTanzaniaNumber(num: string): string {
  const clean = num.replace(/\s/g, "")
  if (clean.startsWith("0")) {
    return `+255${clean.slice(1)}`
  }
  if (clean.startsWith("255")) {
    return `+${clean}`
  }
  if (!clean.startsWith("+")) {
    return `+${clean}`
  }
  return clean
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the latest application for this user
    const application = await prisma.instructorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error("GET become-instructor error:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user is already an expert, no need to apply
    if (user.role === "EXPERT") {
      return NextResponse.json({ error: "You are already an approved instructor" }, { status: 400 })
    }

    // Check if there is already a pending or active application
    const existing = await prisma.instructorApplication.findFirst({
      where: {
        userId,
        status: { in: ["PENDING", "UNDER_REVIEW", "MORE_INFO"] },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "You already have a pending application" }, { status: 400 })
    }

    const body = await req.json()
    const {
      occupation,
      company,
      experienceYears,
      expertise,
      courseTitle,
      courseCategory,
      courseDescription,
      education,
      certifications,
      linkedin,
      website,
      cvUrl,
      certificatesUrl,
      motivation,
    } = body

    if (!occupation || !experienceYears || !expertise || !courseTitle || !courseCategory || !courseDescription || !education || !motivation) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const application = await prisma.instructorApplication.create({
      data: {
        userId,
        occupation,
        company: company || null,
        experienceYears: Number(experienceYears),
        expertise,
        courseTitle,
        courseCategory,
        courseDescription,
        education,
        certifications: certifications || null,
        linkedin: linkedin || null,
        website: website || null,
        cvUrl: cvUrl || null,
        certificatesUrl: certificatesUrl || null,
        motivation,
        status: "PENDING",
      },
    })

    // Notify via SMS
    const adminPhones = ["0746617796", "0768828247"].map(formatTanzaniaNumber)
    const smsMessage = `[YIF LMS] New application submitted by ${user.name}. Occupation: ${occupation}. Course: ${courseTitle}. Review at Admin Panel.`

    for (const phone of adminPhones) {
      try {
        await sendGeneralSms(phone, smsMessage)
      } catch (smsErr) {
        console.error(`Failed to send SMS notification to ${phone}:`, smsErr)
      }
    }

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error("POST become-instructor error:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
