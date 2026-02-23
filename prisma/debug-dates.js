const { PrismaClient } = require('../lib/generated/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Latest Data Dates ---');
    try {
        const stats = await prisma.fundDailySummary.groupBy({
            by: ['fundId'],
            _max: { date: true },
            _count: { fundId: true }
        });
        console.table(stats.map(s => ({
            fundId: s.fundId,
            count: s._count.fundId,
            latestDate: s._max.date ? s._max.date.toISOString() : 'N/A'
        })));

        const funds = await prisma.fund.findMany({ select: { fundId: true, fundName: true } });
        console.log('\n--- Registry Fund IDs ---');
        console.table(funds);

    } catch (err) { console.error('Error:', err); }
    finally { await prisma.$disconnect(); }
}
main();
