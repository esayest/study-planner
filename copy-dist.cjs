const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

const itemsToCopy = ['index.html', 'assets', 'css', 'js'];

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const item of itemsToCopy) {
  const srcPath = path.join(rootDir, item);
  const destPath = path.join(distDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
  }
}

console.log('✓ Successfully prepared dist/ directory for Tauri');
