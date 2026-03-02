require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('DATABASE_URL:', process.env.DATABASE_URL);
        console.log('Attempting to connect to database...');
        const count = await prisma.user.count();
        console.log('Success! User count:', count);
    } catch (error) {
        console.error('Database connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
