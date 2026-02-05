export type SessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface LiveSession {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    scheduledStart: Date;
    scheduledEnd: Date;
    status: SessionStatus;
    meetingUrl?: string | null;
}

export interface UserEnrollment {
    id: string;
    userId: string;
    courseId: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    enrolledAt: Date;
    expiresAt: Date | null;
}

export interface AccessToken {
    id: string;
    userId: string;
    sessionId: string;
    deviceFingerprint: string;
    expiresAt: Date;
    usedAt: Date | null;
}

export interface AccessAttemptLog {
    id: string;
    userId?: string | null;
    sessionId?: string | null;
    ipAddress?: string | null;
    deviceFingerprint?: string | null;
    userAgent?: string | null;
    status: 'success' | 'denied';
    reason?: string | null;
    createdAt: Date;
}
