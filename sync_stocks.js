const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('./lib/generated/client');

const prisma = new PrismaClient();

async function syncStocks() {
    try {
        const filePath = path.join(__dirname, 'fund_pipeline', 'data', 'stocks', 'dse_stocks_latest.json');
        if (!fs.existsSync(filePath)) {
            console.error('Stock data file not found:', filePath);
            return;
        }

        const stocks = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`Read ${stocks.length} stocks from JSON.`);

        let count = 0;
        for (const s of stocks) {
            // 1. Upsert Stock
            const stock = await prisma.stock.upsert({
                where: { symbol: s.symbol },
                update: {
                    name: s.name,
                    dividendYield: s.dividend_yield || 0,
                    peRatio: s.pe_ratio || 0,
                    marketCap: s.market_cap ? parseFloat(s.market_cap.toString()) : 0,
                },
                create: {
                    symbol: s.symbol,
                    name: s.name,
                    dividendYield: s.dividend_yield || 0,
                    peRatio: s.pe_ratio || 0,
                    marketCap: s.market_cap ? parseFloat(s.market_cap.toString()) : 0,
                }
            });

            // 2. Add price history entry
            await prisma.stockPriceHistory.upsert({
                where: {
                    stockId_timestamp: {
                        stockId: stock.id,
                        timestamp: new Date() // Current timestamp for the "latest" sync
                    }
                },
                update: {
                    price: s.price || 0,
                    change: s.change || 0,
                    changePct: s.change_pct || 0,
                    dividendYield: s.dividend_yield || 0,
                    dividendGrowth: s.dividend_growth || 0,
                },
                create: {
                    stockId: stock.id,
                    price: s.price || 0,
                    change: s.change || 0,
                    changePct: s.change_pct || 0,
                    dividendYield: s.dividend_yield || 0,
                    dividendGrowth: s.dividend_growth || 0,
                    timestamp: new Date()
                }
            });
            count++;
        }

        console.log(`Successfully synced ${count} stocks to the database.`);
    } catch (error) {
        console.error('Stock sync failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncStocks();
