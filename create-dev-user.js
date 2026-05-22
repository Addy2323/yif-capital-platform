const { PrismaClient } = require('./lib/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@yifcapital.co.tz';
    const password = 'Password123!';
    const name = 'Admin User';
    const phone = '+255712345678';

    console.log(`Setting up dev login credentials...`);
    console.log(`Target Email: ${email}`);
    console.log(`Target Password: ${password}`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email: email.toLowerCase() },
            update: {
                password: hashedPassword,
                isVerified: true,
                role: 'ADMIN',
                name: name,
                phoneNumber: phone
            },
            create: {
                email: email.toLowerCase(),
                name: name,
                password: hashedPassword,
                phoneNumber: phone,
                isVerified: true,
                role: 'ADMIN'
            }
        });

        console.log(`\n========================================`);
        console.log(`Success! Dev credentials configured.`);
        console.log(`Email:    ${user.email}`);
        console.log(`Password: ${password}`);
        console.log(`Role:     ${user.role}`);
        console.log(`Verified: ${user.isVerified}`);
        console.log(`========================================`);
        console.log(`You can now log in using these credentials!`);
    } catch (error) {
        console.error('Error creating dev user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
