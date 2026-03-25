/**
 * Regenerates square PWA icons from the current source PNG.
 * Fixes manifest size vs actual pixel mismatch (e.g. 1376×768) which breaks
 * Android launcher icons after install.
 */
const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

async function main() {
  const root = path.join(__dirname, "..")
  const srcPath = path.join(root, "public/icons/icon-512.png")
  const buf = fs.readFileSync(srcPath)

  const pad = Math.round(512 * 0.12)
  const inner = 512 - 2 * pad
  const navy = { r: 10, g: 31, b: 68, alpha: 1 }

  await sharp(buf).resize(512, 512, { fit: "cover", position: "center" }).png().toFile(path.join(root, "public/icons/icon-512.png"))

  await sharp(buf).resize(192, 192, { fit: "cover", position: "center" }).png().toFile(path.join(root, "public/icons/icon-192.png"))

  await sharp(buf).resize(180, 180, { fit: "cover", position: "center" }).png().toFile(path.join(root, "public/icons/icon-180.png"))

  await sharp(buf)
    .resize(inner, inner, { fit: "cover", position: "center" })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: navy })
    .png()
    .toFile(path.join(root, "public/icons/icon-maskable-512.png"))

  console.log("PWA icons written to public/icons/ (512, 192, 180, maskable-512)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
