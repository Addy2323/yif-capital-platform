const fs = require('fs');
const path = require('path');

const IS_PROD = process.argv.includes('--prod');
const BASE_URL = IS_PROD ? 'https://yifcapital.co.tz' : 'http://localhost:3000';
const UPDATE_ENDPOINT = `${BASE_URL}/api/funds/update`;
const CHUNK_SIZE = 500; // Chunk size to avoid "Request Entity Too Large"

console.log(`\n=================================================`);
console.log(`🚀 STARTING CHUNKED FUND DATA SYNC`);
console.log(`📍 Target: ${BASE_URL}`);
console.log(`📦 Chunk Size: ${CHUNK_SIZE}`);
console.log(`=================================================\n`);

function normalizeDate(rawDate) {
    if (!rawDate || typeof rawDate !== 'string') return null;
    if (rawDate.includes('-')) {
        const parts = rawDate.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 2 && parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
            if (parts[0].length === 4) return rawDate;
        }
    }
    return rawDate;
}

function cleanNum(val) {
    if (val === null || val === undefined) return 0.0;
    if (typeof val === 'number') return val;
    return parseFloat(String(val).replace(/,/g, '').trim()) || 0.0;
}

async function syncWithRetry(sourceId, data, attempt = 1) {
    try {
        const response = await fetch(UPDATE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: sourceId, data: data })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        return true;
    } catch (err) {
        if (attempt < 3) {
            console.log(`   🔸 Retrying ${sourceId} (Attempt ${attempt + 1})...`);
            await new Promise(r => setTimeout(r, 1000));
            return syncWithRetry(sourceId, data, attempt + 1);
        }
        throw err;
    }
}

async function syncFile(filename, sourceId, defaultFundName) {
    const filePath = path.join(__dirname, 'fund_pipeline', 'data', filename);
    if (!fs.existsSync(filePath)) return console.log(`⚠️  File ${filename} not found.`);

    console.log(`📂 Processing ${filename}...`);
    let rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let processedData = [];

    rawData.forEach(record => {
        let mapped = null;
        if (Array.isArray(record)) {
            if (sourceId === 'utt-amis' && record.length >= 8) {
                mapped = { fund_name: record[1], total_nav: cleanNum(record[2]), units: cleanNum(record[3]), nav_per_unit: cleanNum(record[4]), sale_price: cleanNum(record[5]), repurchase_price: cleanNum(record[6]), date: normalizeDate(record[7]) };
            } else if (sourceId === 'zansec' && record.length >= 7 && !record[1]?.includes('Fund')) {
                mapped = { total_nav: cleanNum(record[1]), units: cleanNum(record[2]), nav_per_unit: cleanNum(record[3]), sale_price: cleanNum(record[4]), repurchase_price: cleanNum(record[5]), date: normalizeDate(record[6]), fund_name: defaultFundName };
            }
        } else if (record && typeof record === 'object') {
            if (sourceId !== 'utt-amis' && record.source === 'utt-amis') return;
            mapped = { ...record, date: normalizeDate(record.date), total_nav: cleanNum(record.total_nav), units: cleanNum(record.units), nav_per_unit: cleanNum(record.nav_per_unit), sale_price: cleanNum(record.sale_price), repurchase_price: cleanNum(record.repurchase_price), fund_name: record.fund_name || defaultFundName };
        }
        if (mapped && mapped.date && mapped.date !== 'Invalid Date') processedData.push(mapped);
    });

    if (processedData.length === 0) return console.log(`ℹ️  No valid records in ${filename}`);

    const seen = new Set();
    const uniqueData = [];
    processedData.sort((a, b) => b.date.localeCompare(a.date)).forEach(r => {
        const key = `${r.date}|${r.fund_name}`;
        if (!seen.has(key)) { seen.add(key); uniqueData.push(r); }
    });

    console.log(`📊 Total unique records for ${sourceId}: ${uniqueData.length}`);
    let successCount = 0;
    for (let i = 0; i < uniqueData.length; i += CHUNK_SIZE) {
        const chunk = uniqueData.slice(i, i + CHUNK_SIZE);
        const batchNum = Math.floor(i / CHUNK_SIZE) + 1;
        const totalBatches = Math.ceil(uniqueData.length / CHUNK_SIZE);
        try {
            await syncWithRetry(sourceId, chunk);
            successCount += chunk.length;
            process.stdout.write(`   ✅ Batch ${batchNum}/${totalBatches} synced\r`);
        } catch (err) {
            console.error(`\n❌ Failed batch ${batchNum}/${totalBatches} for ${sourceId}: ${err.message}`);
        }
    }
    console.log(`\n🎉 Completed ${sourceId}: ${successCount}/${uniqueData.length} synced.\n`);
}

async function runSync() {
    await syncFile('utt-amis.json', 'utt-amis', null);
    await syncFile('whi.json', 'whi', 'WHI Income Fund');
    await syncFile('zansec.json', 'zansec', 'Zansec Bond Fund');
    await syncFile('vertex.json', 'vertex', 'Vertex Bond Fund');
    await syncFile('sanlam-pesa.json', 'sanlam-pesa', 'Sanlam Pesa Money Market Fund');
    console.log(`🏁 ALL SYNC TASKS COMPLETE\n`);
}

runSync().catch(console.error);
