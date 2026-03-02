const fs = require('fs');
const path = require('path');

async function syncData() {
    try {
        const filePath = path.join(__dirname, 'fund_pipeline', 'data', 'zansec.json');
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return;
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Read ${data.length} records from zansec.json`);

        // Attempt to sync
        const response = await fetch('http://localhost:3000/api/funds/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'zansec', data: data })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
    } catch (error) {
        console.error('Sync failed:', error.message);
    }
}

syncData();
