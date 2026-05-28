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
// allowAnyUserToStartMeeting=true + guestPolicy=ALWAYS_ACCEPT prevents the
// "waiting for moderator" lobby so expert and client always see each other immediately.
export async function bbbCreateMeeting(meetingID: string, name: string): Promise<void> {
  if (!BBB_SECRET) throw new Error("BBB_SECRET is not configured")
  const { moderatorPW, attendeePW } = passwords(meetingID)
  const url = buildBbbUrl("create", {
    meetingID,
    name,
    moderatorPW,
    attendeePW,
    record: "false",
    allowStartStopRecording: "false",
    guestPolicy: "ALWAYS_ACCEPT",
    allowModsToUnmuteUsers: "true",
    // Keep the room alive so late joiners don't end up in a brand-new instance
    endWhenNoModerator: "false",
    endWhenNoModeratorDelayInMinutes: "30",
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BBB create failed: HTTP ${res.status}`)
  // Parse XML to surface any BBB-level errors (returncode=FAILED)
  const xml = await res.text()
  if (xml.includes("<returncode>FAILED</returncode>")) {
    const msg = xml.match(/<message>(.*?)<\/message>/)?.[1] ?? "unknown"
    throw new Error(`BBB create error: ${msg}`)
  }
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
