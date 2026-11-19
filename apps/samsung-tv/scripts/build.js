/**
 * StreamX Samsung Tizen Web App Build Script
 * Prepares artifacts and verifies configuration for Tizen Studio / CLI packaging.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.resolve(rootDir, 'www');

console.log('[StreamX Tizen] Validating build assets...');

// Ensure config.xml is copied into www directory
fs.copyFileSync(
  path.join(rootDir, 'config.xml'),
  path.join(wwwDir, 'config.xml')
);

fs.copyFileSync(
  path.join(rootDir, 'tizen-manifest.xml'),
  path.join(wwwDir, 'tizen-manifest.xml')
);

const requiredFiles = [
  'index.html',
  'config.xml',
  'tizen-manifest.xml',
  'icon.png',
  'css/tv-style.css',
  'js/tizen-adapter.js',
  'js/spatial-navigation.js',
  'js/tv-player.js',
  'js/app.js'
];

let allValid = true;
for (const file of requiredFiles) {
  const filePath = path.join(wwwDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[StreamX Tizen] Missing required file: ${file}`);
    allValid = false;
  }
}

if (!allValid) {
  process.exit(1);
}

console.log('[StreamX Tizen] All Tizen assets verified successfully.');
