
const { execSync } = require('child_process');
const fs = require('fs');

const url = "postgresql://postgres:myamba2323@localhost:5432/yifdb?schema=public";
const schema = "prisma/schema.prisma";
const outputFile = "prisma/migrations/add_pricing_plan/migration.sql";

try {
    const sql = execSync(`npx prisma migrate diff --from-url "${url}" --to-schema-datamodel "${schema}" --script`).toString();
    fs.writeFileSync(outputFile, sql, 'utf8');
    console.log('Successfully wrote migration SQL to', outputFile);
} catch (e) {
    console.error('Error generating migration:', e.message);
    process.exit(1);
}
