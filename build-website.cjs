const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const docsDir = path.join(rootDir, 'docs');
const appDir = path.join(docsDir, 'app');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Ensure docs and app directories exist
['docs', 'docs/assets', 'docs/css', 'docs/js', 'docs/app'].forEach(d => {
  const p = path.join(rootDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 2. Synchronize assets to docs/assets
copyRecursive(path.join(rootDir, 'assets'), path.join(docsDir, 'assets'));

// 3. Synchronize full app to docs/app/ for GitHub Pages live demo
copyRecursive(path.join(rootDir, 'assets'), path.join(appDir, 'assets'));
copyRecursive(path.join(rootDir, 'css'), path.join(appDir, 'css'));
copyRecursive(path.join(rootDir, 'js'), path.join(appDir, 'js'));
fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(appDir, 'index.html'));

console.log('✓ Successfully built and synchronized website in docs/');
