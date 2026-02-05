import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "yif-capital-default-secret-change-me";
const TOKEN_EXPIRY_MINUTES = parseInt(process.env.TOKEN_EXPIRY_MINUTES || "90");

export interface TokenPayload {
    userId: string;
    sessionId: string;
    deviceFingerprint: string;
    enrollmentId: string;
}

/**
 * Service for managing single-use, device-bound access tokens
 */
export const TokenService = {
    /**
     * Generates a signle-use token and stores its hash in the database
     */
    async generateToken(payload: TokenPayload): Promise<string> {
        // 1. Create JWT token
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: `${TOKEN_EXPIRY_MINUTES}m`,
        });

        // 2. Hash the token for storage
        const tokenHash = this.hashToken(token);

        // 3. Store in database
        await prisma.accessToken.create({
            data: {
                tokenHash,
                userId: payload.userId,
                sessionId: payload.sessionId,
                deviceFingerprint: payload.deviceFingerprint,
                expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        return token;
    },

    /**
     * Validates a token and marks it as used if valid
     */
    async validateAndUseToken(token: string, deviceFingerprint: string): Promise<{
        isValid: boolean;
        reason?: 'expired' | 'used' | 'wrong_device' | 'invalid_token' | 'not_found';
        payload?: TokenPayload;
    }> {
        try {
            // 1. Verify JWT signature and basic expiry
            const decoded = jwt.verify(token, JWT_SECRET) as any as TokenPayload;

            // 2. Hash the token to look up in DB
            const tokenHash = this.hashToken(token);

            // 3. Find token in DB
            const storedToken = await prisma.accessToken.findUnique({
                where: { tokenHash },
            });

            if (!storedToken) {
                return { isValid: false, reason: "not_found" };
            }

            // 4. Check if already used (Single-use enforcement)
            if (storedToken.usedAt) {
                return { isValid: false, reason: "used" };
            }

            // 5. Check expiry from DB (as a second layer)
            if (new Date() > storedToken.expiresAt) {
                return { isValid: false, reason: "expired" };
            }

            // 6. Check device fingerprint match (Device binding)
            if (storedToken.deviceFingerprint !== deviceFingerprint) {
                return { isValid: false, reason: "wrong_device" };
            }

            // 7. Mark as used
            await prisma.accessToken.update({
                where: { id: storedToken.id },
                data: { usedAt: new Date() },
            });

            return { isValid: true, payload: decoded };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return { isValid: false, reason: "expired" };
            }
            return { isValid: false, reason: "invalid_token" };
        }
    },

    /**
     * Helper to hash tokens for secure storage
     */
    hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    },

    /**
     * Generates a device fingerprint from browser identifiers
     */
    generateFingerprint(userAgent: string, screenResolution: string, timezone: string): string {
        const raw = `${userAgent}-${screenResolution}-${timezone}`;
        return crypto.createHash("sha256").update(raw).digest("hex");
    }
};
