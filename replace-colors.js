const fs = require('fs');
const path = require('path');

const SRC_DIR = './frontend/src';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace hex colors (case-insensitive)
  content = content.replace(/#6366f1/gi, 'var(--brand-accent)');
  content = content.replace(/#818cf8/gi, 'var(--brand-accent-hover)');
  content = content.replace(/#4f46e5/gi, 'var(--brand-accent-dark)');
  content = content.replace(/#a5b4fc/gi, 'var(--brand-accent-light)');
  content = content.replace(/#c7d2fe/gi, 'var(--brand-accent-light)');

  // Replace rgba colors
  content = content.replace(/rgba\(\s*99\s*,\s*102\s*,\s*241/gi, 'rgba(16, 185, 129');
  content = content.replace(/rgba\(\s*139\s*,\s*92\s*,\s*246/gi, 'rgba(16, 185, 129');
  content = content.replace(/rgba\(\s*165\s*,\s*180\s*,\s*252/gi, 'rgba(52, 211, 153');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

traverse(SRC_DIR);
console.log('Color replacement complete!');
