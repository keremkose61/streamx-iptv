/**
 * StreamX LG webOS Web App Build Script
 * Prepares artifacts and verifies configuration for webOS CLI (ares-package).
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.resolve(rootDir, 'www');
const distDir = path.resolve(rootDir, 'dist');

console.log('[StreamX webOS] Validating build assets...');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy appinfo.json into www
fs.copyFileSync(
  path.join(rootDir, 'appinfo.json'),
  path.join(wwwDir, 'appinfo.json')
);

const requiredFiles = [
  'index.html',
  'appinfo.json',
  'icon.png',
  'largeIcon.png',
  'splash.png',
  'css/tv-style.css',
  'js/webos-adapter.js',
  'js/spatial-navigation.js',
  'js/tv-player.js',
  'js/app.js'
];

let allValid = true;
for (const file of requiredFiles) {
  const filePath = path.join(wwwDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[StreamX webOS] Missing required file: ${file}`);
    allValid = false;
  }
}

if (!allValid) {
  process.exit(1);
}

console.log('[StreamX webOS] All webOS assets verified successfully.');
