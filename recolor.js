const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'app/portfolio/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const replacements = {
    // Greens to Golds
    '#00c89610': '#D4A0171A',
    '#00c89611': '#D4A0171C',
    '#00c89622': '#D4A01733',
    '#00c89633': '#D4A0174D',
    '#00c89644': '#D4A01766',
    '#00c89666': '#D4A01799',
    '#00c896': '#D4A017',

    // Backgrounds to Navys
    '#0a0f1e': '#0A1F44',
    '#111827': '#1A3A6E',
    '#060c18': '#051430',
    '#0d1520': '#0D2654',
    '#1a2538': '#2A4A8E',
    '#1e2d45': '#24427E',
    '#2a3d57': '#375692',

    // Muted text tweaks
    '#6b7fa3': '#B0B8C1', // Silver
    '#94a8c7': '#E2E8F0', // Light slate

    // Keep warning gold/yellow as is or enhance
    '#f5c84210': '#D4A0171A',
    '#f5c84233': '#D4A0174D',
    '#f5c84222': '#D4A01733',
    '#f5c842': '#F59E0B' // Warning yellow
};

for (const [oldColor, newColor] of Object.entries(replacements)) {
    // Escape for regex and make case insensitive
    const regex = new RegExp(oldColor, 'gi');
    content = content.replace(regex, newColor);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Colors replaced successfully!');
