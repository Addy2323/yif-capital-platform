const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();

async function migrateData() {
    try {
        console.log('Starting portfolio stock data migration...');

        // 1. Fetch all portfolio stocks that need a stockId
        const stocksToMigrate = await prisma.portfolioStock.findMany({
            where: {
                stockId: null
            }
        });

        console.log(`Found ${stocksToMigrate.length} items to migrate.`);

        let successCount = 0;
        let failCount = 0;

        for (const ps of stocksToMigrate) {
            // Find stock by symbol (mapping ticker to symbol)
            const symbol = ps.ticker;
            if (!symbol) {
                console.warn(`PortfolioStock ${ps.id} has no ticker. Skipping.`);
                failCount++;
                continue;
            }

            const stock = await prisma.stock.findUnique({
                where: { symbol: symbol.toUpperCase() }
            });

            if (stock) {
                await prisma.portfolioStock.update({
                    where: { id: ps.id },
                    data: {
                        stockId: stock.id
                    }
                });
                successCount++;
            } else {
                console.warn(`Could not find Stock record for symbol: ${symbol}`);
                failCount++;
            }
        }

        console.log(`Migration complete!`);
        console.log(`Successfully linked: ${successCount}`);
        console.log(`Failed/Skipped: ${failCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateData();
