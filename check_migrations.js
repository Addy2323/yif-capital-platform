
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const migrations = await prisma.$queryRaw`SELECT * FROM "_prisma_migrations"`;
        const names = migrations.map(m => m.migration_name);
        console.log('Migrations in DB (names):', names);
    } catch (e) {
        console.error('Error fetching migrations:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
