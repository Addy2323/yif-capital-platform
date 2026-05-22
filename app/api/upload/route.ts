import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "misc"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    const videoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
    const docTypes = ["application/pdf"]
    const allowedTypes = [...imageTypes, ...videoTypes, ...docTypes]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only images, videos (MP4/WebM), and PDFs are allowed" }, { status: 400 })
    }

    const isVideo = videoTypes.includes(file.type)
    const isPdf = docTypes.includes(file.type)
    const maxSize = isVideo ? 200 * 1024 * 1024 : isPdf ? 20 * 1024 * 1024 : 5 * 1024 * 1024

    if (file.size > maxSize) {
      const limit = isVideo ? "200 MB" : isPdf ? "20 MB" : "5 MB"
      return NextResponse.json({ error: `File must be under ${limit}` }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = join(process.cwd(), "public", "uploads", folder)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ url: `/uploads/${folder}/${filename}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
