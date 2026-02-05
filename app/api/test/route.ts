import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const results: Record<string, any> = {};

    try {
        // 1. Test cookies
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;
        results.userId = userId;
        results.hasCookie = !!userId;

        if (!userId) {
            return NextResponse.json({ error: "No user_id cookie", results });
        }

        // 2. Test user lookup
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            results.userFound = !!user;
            results.userEmail = user?.email;
        } catch (e: any) {
            results.userError = e.message;
        }

        // 3. Test session lookup
        const sessionId = "a812eb27-2ac2-4554-a344-df9c8d8664b9";
        try {
            const session = await prisma.liveSession.findUnique({ where: { id: sessionId } });
            results.sessionFound = !!session;
            results.sessionTitle = session?.title;
            results.sessionIsFree = session?.isFree;
        } catch (e: any) {
            results.sessionError = e.message;
        }

        // 4. Test enrollment check
        try {
            const enrollment = await prisma.enrollment.findFirst({
                where: { userId, status: "ACTIVE" }
            });
            results.enrollmentFound = !!enrollment;
        } catch (e: any) {
            results.enrollmentError = e.message;
        }

        // 5. Test payment check
        try {
            const payment = await prisma.payment.findFirst({
                where: { userId, sessionId, status: "success" }
            });
            results.paymentFound = !!payment;
        } catch (e: any) {
            results.paymentError = e.message;
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        return NextResponse.json({
            error: "Test failed",
            message: error.message,
            stack: error.stack,
            results
        });
    }
}
