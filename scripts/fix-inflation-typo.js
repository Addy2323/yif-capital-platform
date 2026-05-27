const { PrismaClient } = require("../lib/generated/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Searching for economic indicators with typo 'Infition'...");
  const indicators = await prisma.economicIndicator.findMany();
  let updatedCount = 0;
  
  for (const ind of indicators) {
    if (ind.title.toLowerCase().includes("infition")) {
      const oldTitle = ind.title;
      const newTitle = ind.title.replace(/infition/i, "Inflation");
      console.log(`Updating "${oldTitle}" to "${newTitle}"...`);
      await prisma.economicIndicator.update({
        where: { id: ind.id },
        data: { title: newTitle }
      });
      updatedCount++;
    }
  }
  
  if (updatedCount > 0) {
    console.log(`Successfully updated ${updatedCount} indicator(s).`);
  } else {
    console.log("No indicators with typo 'Infition' were found in the database.");
  }
}

main()
  .catch(err => {
    console.error("Error running fix script:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
