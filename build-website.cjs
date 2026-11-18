const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const docsDir = path.join(rootDir, 'docs');

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

function removeRecursive(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

// 1. Clean previous landing page remnants and sub-app directories
removeRecursive(path.join(docsDir, 'app'));
removeRecursive(path.join(docsDir, 'css', 'landing.css'));
removeRecursive(path.join(docsDir, 'js', 'landing.js'));

// 2. Ensure docs directory structure exists
['docs', 'docs/assets', 'docs/css', 'docs/js'].forEach(d => {
  const p = path.join(rootDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 3. Mirror the core web application directly to docs/ (root website)
copyRecursive(path.join(rootDir, 'assets'), path.join(docsDir, 'assets'));
copyRecursive(path.join(rootDir, 'css'), path.join(docsDir, 'css'));
copyRecursive(path.join(rootDir, 'js'), path.join(docsDir, 'js'));
fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(docsDir, 'index.html'));

console.log('✓ Successfully mirrored web application directly to docs/ (Zero landing page overhead)');
