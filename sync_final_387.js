const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('./lib/generated/client');

const prisma = new PrismaClient();

async function syncData() {
    try {
        const filePath = path.join(__dirname, 'fund_pipeline', 'data', 'zansec.json');
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return;
        }
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fundId = 'zansec-bond';

        console.log(`Read ${rawData.length} items from zansec.json`);

        function cleanNum(val) {
            if (typeof val === 'number') return val;
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'string') {
                return parseFloat(val.replace(/,/g, '').trim()) || 0;
            }
            return 0;
        }

        const data = rawData.map(item => {
            if (!Array.isArray(item)) {
                return {
                    nav_per_unit: cleanNum(item.nav_per_unit),
                    total_nav: cleanNum(item.total_nav),
                    sale_price: cleanNum(item.sale_price),
                    repurchase_price: cleanNum(item.repurchase_price),
                    date: item.date,
                    volatility: cleanNum(item.volatility),
                    daily_return: cleanNum(item.daily_return)
                };
            }

            // Map list to object based on Zansec structure:
            // [Index, Total NAV, Units, NAV/Unit, Sale, Repurchase, Date]
            return {
                nav_per_unit: cleanNum(item[3]),
                total_nav: cleanNum(item[1]),
                sale_price: cleanNum(item[4]),
                repurchase_price: cleanNum(item[5]),
                date: item[6],
                volatility: 0,
                daily_return: 0
            };
        });

        console.log('Starting direct database sync for all 387 records...');

        let updatedCount = 0;
        for (const record of data) {
            const date = new Date(record.date);
            if (isNaN(date.getTime())) {
                console.warn('Skipping invalid date:', record.date);
                continue;
            }

            // Normalize date to midnight UTC to avoid duplication issues
            date.setUTCHours(0, 0, 0, 0);

            await prisma.fundDailySummary.upsert({
                where: {
                    fundId_date: {
                        fundId,
                        date
                    }
                },
                update: {
                    nav: record.nav_per_unit,
                    aum: record.total_nav,
                    volatility: record.volatility || 0,
                    dailyReturn: record.daily_return || 0,
                    salePrice: record.sale_price || 0,
                    repurchasePrice: record.repurchase_price || 0
                },
                create: {
                    fundId,
                    date,
                    nav: record.nav_per_unit,
                    aum: record.total_nav,
                    volatility: record.volatility || 0,
                    dailyReturn: record.daily_return || 0,
                    salePrice: record.sale_price || 0,
                    repurchasePrice: record.repurchase_price || 0
                }
            });
            updatedCount++;
        }

        console.log(`Successfully synced ${updatedCount} records to the database.`);
    } catch (error) {
        console.error('Direct sync failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncData();
