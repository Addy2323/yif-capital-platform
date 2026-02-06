const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreAdmin(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });

        console.log(`Successfully restored ADMIN role for ${email}`);
    } catch (error) {
        console.error('Error restoring admin role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Replace with your email
const emailToRestore = 'admin@yifcapital.co.tz'; // Or whatever your email is

// If you want to use command line: node restore-admin.js your@email.com
const args = process.argv.slice(2);
const targetEmail = args[0] || emailToRestore;

restoreAdmin(targetEmail);
