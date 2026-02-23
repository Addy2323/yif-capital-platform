const { PrismaClient } = require('../lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Clearing Database Tables ---');
    try {
        const summary = await prisma.fundDailySummary.deleteMany({});
        console.log(`Deleted ${summary.count} records from FundDailySummary`);

        // Also clear NavHistoryExtended if it exists
        try {
            const history = await prisma.navHistoryExtended.deleteMany({});
            console.log(`Deleted ${history.count} records from NavHistoryExtended`);
        } catch (e) { console.log('NavHistoryExtended table not found or empty'); }

        console.log('Success: Database cleared.');
    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
