
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.pricingPlan.count();
        console.log('PricingPlan count:', count);
        if (count > 0) {
            const plans = await prisma.pricingPlan.findMany();
            console.log('Plans:', plans.map(p => p.planId));
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
