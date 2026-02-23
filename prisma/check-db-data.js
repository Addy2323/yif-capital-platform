/**
 * Debugging script to count records in the production database
 * Run with: node prisma/check-db-data.js
 */
const { PrismaClient } = require('../lib/generated/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database counts...');

    try {
        const summaryCount = await prisma.fundDailySummary.count();
        console.log(`FundDailySummary records: ${summaryCount}`);

        if (summaryCount > 0) {
            const groups = await prisma.fundDailySummary.groupBy({
                by: ['fundId'],
                _count: { fundId: true }
            });
            console.log('Records by Fund ID:');
            console.table(groups);
        } else {
            console.log('WARNING: FundDailySummary table is empty.');
        }

        const fundCount = await prisma.fund.count();
        console.log(`Fund registry records: ${fundCount}`);

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
