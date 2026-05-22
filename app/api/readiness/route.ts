import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getCurrentUserId() {
  const cookieStore = await cookies()
  return cookieStore.get("user_id")?.value || null
}

// GET user's latest investment readiness quiz results
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const latestResult = await prisma.readinessResult.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
      include: {
        quiz: {
          select: { title: true, description: true }
        }
      }
    })

    return NextResponse.json(latestResult || { status: "not_taken" })
  } catch (error) {
    console.error("Fetch readiness result error:", error)
    // Fallback if schema doesn't exist or table has issues
    return NextResponse.json({ status: "not_taken", error: "Database offline" })
  }
}

// POST save a new investment readiness quiz attempt
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { totalScore, level, answers } = body

    if (totalScore === undefined || !level || !answers) {
      return NextResponse.json({ error: "Missing required fields: totalScore, level, answers" }, { status: 400 })
    }

    // Ensure at least one ReadinessQuiz exists in the DB so we can reference it
    let quiz = await prisma.readinessQuiz.findFirst()
    if (!quiz) {
      quiz = await prisma.readinessQuiz.create({
        data: {
          title: "General Investment Readiness Assessment",
          description: "Assess your risk tolerance, timeline, and knowledge tier.",
          isActive: true
        }
      })
    }

    // Save the result
    const result = await prisma.readinessResult.create({
      data: {
        userId,
        quizId: quiz.id,
        totalScore: Number(totalScore),
        level: level.toUpperCase() as any, // BEGINNER, INTERMEDIATE, ADVANCED
        answers: answers // Store JSON payload of replies
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Save readiness result error:", error)
    return NextResponse.json({ error: "Failed to save readiness result" }, { status: 500 })
  }
}
