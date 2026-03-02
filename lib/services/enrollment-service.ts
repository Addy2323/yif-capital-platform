import { prisma } from "@/lib/prisma";
import { Enrollment } from "@prisma/client";

export const EnrollmentService = {
    /**
     * Check if a user has an active enrollment for a course
     */
    async hasActiveEnrollment(userId: string, courseId: string): Promise<boolean> {
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: "ACTIVE",
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });

        return !!enrollment;
    },

    /**
     * Create an enrollment after successful payment
     */
    async createEnrollment(userId: string, courseId: string, paymentId: string, durationDays: number = 30): Promise<Enrollment> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        return prisma.enrollment.create({
            data: {
                userId,
                courseId,
                paymentId,
                status: "ACTIVE",
                expiresAt,
            },
        });
    },

    /**
     * Get all active enrollments for a user
     */
    async getUserEnrollments(userId: string): Promise<Enrollment[]> {
        return prisma.enrollment.findMany({
            where: {
                userId,
                status: "ACTIVE",
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });
    }
};
