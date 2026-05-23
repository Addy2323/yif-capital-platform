const { PrismaClient } = require("./lib/generated/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    const sessionCount = await prisma.userSession.count();
    console.log("Session count:", sessionCount);
    
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users:", users.map(u => ({ id: u.id, email: u.email })));
  } catch (err) {
    console.error("Migration/Sync Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
