const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const plans = await prisma.pricingPlan.findMany();
        console.log('Current plans in DB:', JSON.stringify(plans, null, 2));

        if (plans.length > 0) {
            const plan = plans[0];
            console.log('Testing update on planId:', plan.planId);
            const updated = await prisma.pricingPlan.update({
                where: { planId: plan.planId },
                data: { price: plan.price } // No-op update
            });
            console.log('Update test success');
        } else {
            console.log('No plans found to test update');
        }
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
