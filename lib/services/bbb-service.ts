import crypto from "crypto"

const BBB_API_URL = (process.env.BBB_API_URL ?? "https://meet.yifcapital.co.tz/bigbluebutton/api").replace(/\/$/, "")
const BBB_SECRET = process.env.BBB_SECRET ?? ""

function buildBbbUrl(method: string, params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString()
  const checksum = crypto.createHash("sha256").update(method + qs + BBB_SECRET).digest("hex")
  return `${BBB_API_URL}/${method}?${qs}&checksum=${checksum}`
}

function passwords(meetingID: string) {
  const s = meetingID.slice(-8)
  return { moderatorPW: `mp-${s}`, attendeePW: `ap-${s}` }
}

// Creates the BBB meeting — safe to call even if the meeting already exists (idempotent).
export async function bbbCreateMeeting(meetingID: string, name: string): Promise<void> {
  if (!BBB_SECRET) throw new Error("BBB_SECRET is not configured")
  const { moderatorPW, attendeePW } = passwords(meetingID)
  const url = buildBbbUrl("create", { meetingID, name, moderatorPW, attendeePW, record: "false" })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BBB create failed: HTTP ${res.status}`)
}

// Returns a signed BBB join URL that the browser can redirect to directly.
export function bbbJoinUrl(meetingID: string, fullName: string, isModerator: boolean): string {
  const { moderatorPW, attendeePW } = passwords(meetingID)
  return buildBbbUrl("join", {
    meetingID,
    fullName,
    password: isModerator ? moderatorPW : attendeePW,
    redirect: "true",
  })
}
