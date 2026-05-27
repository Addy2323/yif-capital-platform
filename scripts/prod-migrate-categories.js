const { PrismaClient } = require("../lib/generated/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

const BACKUP_FILE = path.join(__dirname, "category_backup.json");

// Mapping from old enum values to new ones
const CATEGORY_MAPPING = {
  // Stays same:
  STOCK_MARKET: "STOCK_MARKET",
  MUTUAL_FUNDS: "MUTUAL_FUNDS",
  PERSONAL_FINANCE: "PERSONAL_FINANCE",
  
  // Mapped:
  BONDS_TREASURY: "BONDS_FIXED_INCOME",
  REAL_ESTATE: "REAL_ESTATE_ALT",
  SACCO_INVESTMENT: "SACCOS_COOPERATIVE",
  FOREX_EDUCATION: "INSURANCE_RISK",
  STARTUP_INVESTMENT: "ENTREPRENEURSHIP_BUSINESS",
  SME_INVESTMENT: "ENTREPRENEURSHIP_BUSINESS"
};

async function backupAndClean() {
  console.log("--- PHASE 1: BACKUP AND CLEAN (RAW SQL) ---");
  
  // 1. Fetch courses using raw SQL to bypass Prisma client enum validations
  const courses = await prisma.$queryRaw`
    SELECT id, title, category::text as category FROM "LmsCourse"
  `;
  console.log(`Found ${courses.length} courses.`);

  // 2. Fetch experts using raw SQL to bypass Prisma client enum validations
  const experts = await prisma.$queryRaw`
    SELECT id, specializations::text[] as specializations FROM "ExpertProfile"
  `;
  console.log(`Found ${experts.length} expert profiles.`);

  // 3. Save backup
  const backup = { courses, experts };
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
  console.log(`Backup saved to ${BACKUP_FILE}`);

  // 4. Temporarily update courses in DB to STOCK_MARKET where they are invalid
  const courseResult = await prisma.$executeRaw`
    UPDATE "LmsCourse" 
    SET category = 'STOCK_MARKET'::"ExpertCategory" 
    WHERE category::text NOT IN ('STOCK_MARKET', 'MUTUAL_FUNDS', 'PERSONAL_FINANCE')
  `;
  console.log(`Temporarily reset ${courseResult} courses category to STOCK_MARKET.`);

  // 5. Temporarily update experts specializations in DB
  let expertUpdatedCount = 0;
  for (const expert of experts) {
    const hasConflict = expert.specializations.some(s => 
      !["STOCK_MARKET", "MUTUAL_FUNDS", "PERSONAL_FINANCE"].includes(s)
    );
    
    if (hasConflict) {
      const cleanSpecs = expert.specializations.filter(s => 
        ["STOCK_MARKET", "MUTUAL_FUNDS", "PERSONAL_FINANCE"].includes(s)
      );
      if (cleanSpecs.length === 0) {
        cleanSpecs.push("STOCK_MARKET");
      }
      
      // Update using raw SQL to avoid client enum validations
      await prisma.$executeRaw`
        UPDATE "ExpertProfile"
        SET specializations = ${cleanSpecs}::"ExpertCategory"[]
        WHERE id = ${expert.id}
      `;
      expertUpdatedCount++;
    }
  }
  console.log(`Temporarily reset specializations for ${expertUpdatedCount} experts.`);
  console.log("\n✅ Ready for schema push! Now run: npx prisma db push --accept-data-loss");
}

async function restoreAndMap() {
  console.log("--- PHASE 2: RESTORE AND MAP (RAW SQL) ---");
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error(`Error: Backup file not found at ${BACKUP_FILE}`);
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf-8"));
  
  // 1. Restore courses
  let restoredCourses = 0;
  for (const c of backup.courses) {
    const newCategory = CATEGORY_MAPPING[c.category] || "STOCK_MARKET";
    console.log(`Restoring course "${c.title}" category: ${c.category} -> ${newCategory}`);
    await prisma.$executeRaw`
      UPDATE "LmsCourse"
      SET category = ${newCategory}::"ExpertCategory"
      WHERE id = ${c.id}
    `;
    restoredCourses++;
  }
  console.log(`Successfully restored ${restoredCourses} courses.`);

  // 2. Restore experts
  let restoredExperts = 0;
  for (const e of backup.experts) {
    const newSpecs = e.specializations.map(s => CATEGORY_MAPPING[s] || "STOCK_MARKET");
    const uniqueSpecs = [...new Set(newSpecs)];
    console.log(`Restoring expert ID ${e.id} specializations to: ${JSON.stringify(uniqueSpecs)}`);
    await prisma.$executeRaw`
      UPDATE "ExpertProfile"
      SET specializations = ${uniqueSpecs}::"ExpertCategory"[]
      WHERE id = ${e.id}
    `;
    restoredExperts++;
  }
  console.log(`Successfully restored ${restoredExperts} expert profiles.`);
  
  fs.unlinkSync(BACKUP_FILE);
  console.log("\n✅ Cleanup and restoration complete!");
}

async function main() {
  const action = process.argv[2];
  if (action === "backup") {
    await backupAndClean();
  } else if (action === "restore") {
    await restoreAndMap();
  } else {
    console.log("Please specify action: 'backup' or 'restore'");
    console.log("Example: node scripts/prod-migrate-categories.js backup");
  }
}

main()
  .catch(err => {
    console.error("Migration failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
