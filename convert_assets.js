const fs = require('fs');
const path = require('path');

// Asset paths to convert
const assets = [
    'assets/sprites/player.png',
    'assets/sprites/slime.png',
    'assets/sprites/potion.png',
    'assets/sprites/sword.png',
    'assets/tilemaps/tiles/dungeon.png',
    'assets/ui/healthbar.png',
    'assets/ui/expbar.png'
];

// Convert tilemap JSON
const tilemapPath = 'assets/tilemaps/maps/dungeon.json';

// Function to convert file to Base64
function fileToBase64(filePath) {
    const fullPath = path.join(__dirname, filePath);
    const fileData = fs.readFileSync(fullPath);
    return fileData.toString('base64');
}

// Create assets.js content
let output = 'const gameAssets = {\n';

// Convert images to Base64
assets.forEach(asset => {
    const base64 = fileToBase64(asset);
    const key = path.basename(asset, path.extname(asset));
    output += `    ${key}: 'data:image/png;base64,${base64}',\n`;
});

// Convert tilemap JSON
if (fs.existsSync(path.join(__dirname, tilemapPath))) {
    const tilemapData = fs.readFileSync(path.join(__dirname, tilemapPath), 'utf8');
    output += `    dungeonMap: ${tilemapData},\n`;
}

output += '};\n';

// Write to assets.js
fs.writeFileSync('js/assets.js', output);
console.log('Assets converted successfully!'); 