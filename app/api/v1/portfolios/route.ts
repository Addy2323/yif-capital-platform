import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Helper to get user ID from cookies
async function getUserId() {
    const cookieStore = await cookies();
    return cookieStore.get("user_id")?.value;
}

// GET /api/v1/portfolios — Get all portfolios with their stocks and funds
export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const portfolios = await prisma.portfolio.findMany({
            where: { userId },
            include: {
                stocks: { orderBy: { createdAt: "asc" } },
                funds: { orderBy: { createdAt: "asc" } }
            },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json({
            success: true,
            data: portfolios
        });
    } catch (error: any) {
        console.error("[PORTFOLIOS API] Error fetching portfolios:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/v1/portfolios — Sync or Create a portfolio
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, description, stocks, funds } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Portfolio name is required" },
                { status: 400 }
            );
        }

        let portfolio;

        if (id) {
            // Update existing portfolio
            // First, find if it exists and belongs to the user
            const existing = await prisma.portfolio.findUnique({
                where: { id, userId }
            });

            if (!existing) {
                // If not found or not owned, handle as a new creation with this ID (if it's a UUID)
                // or just create a new one. In our case, we'll try to sync via ID.
                portfolio = await prisma.portfolio.create({
                    data: {
                        userId,
                        name,
                        description,
                        stocks: {
                            create: stocks?.map((s: any) => ({
                                ticker: s.ticker,
                                name: s.name,
                                sector: s.sector,
                                qty: s.qty,
                                buyPrice: s.buyPrice,
                                currentPrice: s.currentPrice,
                                dividend: s.dividend || 0,
                                buyDate: s.buyDate ? new Date(s.buyDate) : null
                            })) || []
                        },
                        funds: {
                            create: funds?.map((f: any) => ({
                                name: f.name,
                                type: f.type,
                                invested: f.invested,
                                currentValue: f.currentValue,
                                rate: f.rate || 0,
                                startDate: f.startDate ? new Date(f.startDate) : null,
                                maturityDate: f.maturityDate ? new Date(f.maturityDate) : null
                            })) || []
                        }
                    },
                    include: { stocks: true, funds: true }
                });
            } else {
                // Update existing
                // We'll reset stocks and funds for a full sync (simple approach) or diff them.
                // Simple approach: Delete existing and recreate (re-sync)
                await prisma.portfolioStock.deleteMany({ where: { portfolioId: id } });
                await prisma.portfolioFund.deleteMany({ where: { portfolioId: id } });

                portfolio = await prisma.portfolio.update({
                    where: { id },
                    data: {
                        name,
                        description,
                        stocks: {
                            create: stocks?.map((s: any) => ({
                                ticker: s.ticker,
                                name: s.name,
                                sector: s.sector,
                                qty: s.qty,
                                buyPrice: s.buyPrice,
                                currentPrice: s.currentPrice,
                                dividend: s.dividend || 0,
                                buyDate: s.buyDate ? new Date(s.buyDate) : null
                            })) || []
                        },
                        funds: {
                            create: funds?.map((f: any) => ({
                                name: f.name,
                                type: f.type,
                                invested: f.invested,
                                currentValue: f.currentValue,
                                rate: f.rate || 0,
                                startDate: f.startDate ? new Date(f.startDate) : null,
                                maturityDate: f.maturityDate ? new Date(f.maturityDate) : null
                            })) || []
                        }
                    },
                    include: { stocks: true, funds: true }
                });
            }
        } else {
            // New portfolio
            portfolio = await prisma.portfolio.create({
                data: {
                    userId,
                    name,
                    description,
                    stocks: {
                        create: stocks?.map((s: any) => ({
                            ticker: s.ticker,
                            name: s.name,
                            sector: s.sector,
                            qty: s.qty,
                            buyPrice: s.buyPrice,
                            currentPrice: s.currentPrice,
                            dividend: s.dividend || 0,
                            buyDate: s.buyDate ? new Date(s.buyDate) : null
                        })) || []
                    },
                    funds: {
                        create: funds?.map((f: any) => ({
                            name: f.name,
                            type: f.type,
                            invested: f.invested,
                            currentValue: f.currentValue,
                            rate: f.rate || 0,
                            startDate: f.startDate ? new Date(f.startDate) : null,
                            maturityDate: f.maturityDate ? new Date(f.maturityDate) : null
                        })) || []
                    }
                },
                include: { stocks: true, funds: true }
            });
        }

        return NextResponse.json({
            success: true,
            data: portfolio
        });
    } catch (error: any) {
        console.error("[PORTFOLIOS API] Error saving portfolio:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/v1/portfolios?id=xxx
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "ID is required" },
                { status: 400 }
            );
        }

        // Ensure ownership
        const portfolio = await prisma.portfolio.findUnique({
            where: { id, userId }
        });

        if (!portfolio) {
            return NextResponse.json(
                { success: false, error: "Portfolio not found or unauthorized" },
                { status: 404 }
            );
        }

        await prisma.portfolio.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: "Portfolio deleted successfully"
        });
    } catch (error: any) {
        console.error("[PORTFOLIOS API] Error deleting portfolio:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
