import { NextRequest, NextResponse } from "next/server";
import { TokenService } from "@/lib/services/token-service";
import { SessionService } from "@/lib/services/session-service";
import { AccessLogService } from "@/lib/services/access-log-service";

/**
 * Validates an access token and returns the meeting URL
 * (Called by the meet.yifcapital.co.tz application)
 */
export async function POST(req: NextRequest) {
    try {
        const { token, fingerprint } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 });
        }

        // 1. Validate and Use Token (marks as used in DB)
        const validation = await TokenService.validateAndUseToken(token, fingerprint);

        if (!validation.isValid) {
            let message = "Invalid link";
            if (validation.reason === 'expired') message = "Your session access has expired.";
            if (validation.reason === 'used') message = "This session link has already been used. Please request a new access link from your dashboard.";
            if (validation.reason === 'wrong_device') message = "Security: This link can only be used on the original device.";

            return NextResponse.json({
                error: "Forbidden",
                reason: validation.reason,
                message
            }, { status: 403 });
        }

        // 2. Fetch Session for Meeting URL
        const sessionId = validation.payload?.sessionId;
        if (!sessionId) {
            return NextResponse.json({ error: "Session mapping failed" }, { status: 500 });
        }

        const session = await SessionService.getSessionById(sessionId);
        if (!session || !session.meetingUrl) {
            return NextResponse.json({
                error: "Configuration Error",
                message: "Meeting room is not yet configured for this session."
            }, { status: 500 });
        }

        // 3. Return the actual meeting URL (internal)
        return NextResponse.json({
            meetingUrl: session.meetingUrl,
            title: session.title
        });

    } catch (error) {
        console.error("Token Validation Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
