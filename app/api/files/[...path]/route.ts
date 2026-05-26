import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import { join, extname } from "path"

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".pdf": "application/pdf",
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params

    // Prevent path-traversal attacks
    if (segments.some((s) => s === ".." || s.includes("\\"))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const relativePath = segments.join("/")
    const filePath = join(process.cwd(), "public", "uploads", relativePath)

    // Verify the file exists and is inside uploads
    const resolvedPath = require("path").resolve(filePath)
    const uploadsRoot = require("path").resolve(
      join(process.cwd(), "public", "uploads")
    )
    if (!resolvedPath.startsWith(uploadsRoot)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"
    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    console.error("File serve error:", error)
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
