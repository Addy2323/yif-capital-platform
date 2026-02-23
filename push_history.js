const fs = require('fs');
const path = require('path');

function normalizeDate(rawDate) {
    if (!rawDate) return null;
    if (rawDate.includes('-')) {
        const parts = rawDate.split('-');
        if (parts.length === 3) {
            // DD-MM-YYYY -> YYYY-MM-DD
            if (parts[0].length === 2 && parts[2].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            // YYYY-MM-DD
            if (parts[0].length === 4) {
                return rawDate;
            }
        }
    }
    return rawDate;
}

function cleanNum(val) {
    if (val === null || val === undefined) return 0.0;
    if (typeof val === 'number') return val;
    return parseFloat(String(val).replace(/,/g, '').trim()) || 0.0;
}

async function pushFile(filename, source, defaultFundName) {
    const filePath = path.join(__dirname, 'fund_pipeline', 'data', filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filename} not found, skipping.`);
        return;
    }

    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Map records to standard structure
    data = data.map(record => {
        let mapped = {};
        if (Array.isArray(record)) {
            if (source === 'zansec') {
                mapped = {
                    total_nav: cleanNum(record[1]),
                    units: cleanNum(record[2]),
                    nav_per_unit: cleanNum(record[3]),
                    sale_price: cleanNum(record[4]),
                    repurchase_price: cleanNum(record[5]),
                    date: normalizeDate(record[6]),
                    fund_name: defaultFundName
                };
            } else if (source === 'utt-amis') {
                mapped = {
                    fund_name: record[1],
                    total_nav: cleanNum(record[2]),
                    units: cleanNum(record[3]),
                    nav_per_unit: cleanNum(record[4]),
                    sale_price: cleanNum(record[5]),
                    repurchase_price: cleanNum(record[6]),
                    date: normalizeDate(record[7])
                };
            } else if (source === 'whi') {
                mapped = {
                    date: normalizeDate(record[0]),
                    total_nav: cleanNum(record[1]),
                    units: cleanNum(record[2]),
                    nav_per_unit: cleanNum(record[3]),
                    sale_price: cleanNum(record[4]),
                    repurchase_price: cleanNum(record[5]),
                    fund_name: defaultFundName
                };
            }
        } else {
            mapped = {
                ...record,
                date: normalizeDate(record.date),
                total_nav: cleanNum(record.total_nav),
                units: cleanNum(record.units),
                nav_per_unit: cleanNum(record.nav_per_unit),
                sale_price: cleanNum(record.sale_price),
                repurchase_price: cleanNum(record.repurchase_price)
            };
            if (!mapped.fund_name && defaultFundName) {
                mapped.fund_name = defaultFundName;
            }
        }
        return mapped;
    }).filter(r => r.date && r.date !== 'Invalid Date');

    console.log(`Pushing ${data.length} records for ${source} to API...`);

    const response = await fetch('http://localhost:3000/api/funds/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            source: source,
            data: data
        })
    });

    if (response.ok) {
        console.log(`Successfully pushed ${source} data to API`);
    } else {
        console.log(`Failed to push ${source} data:`, response.status, await response.text());
    }
}

async function main() {
    await pushFile('utt-amis.json', 'utt-amis', null);
    await pushFile('zansec.json', 'zansec', 'Zansec Bond Fund');
    await pushFile('whi.json', 'whi', 'WHI Income Fund');
}

main();
