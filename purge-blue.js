const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'frontend', 'src');

const replacements = [
  // Slate-900 Hex -> Charcoal Black
  { regex: /#0[Ff]172[Aa]/g, replacement: '#0F1115' },
  // Slate-900 RGB -> Charcoal Black RGB
  { regex: /15,\s*23,\s*42/g, replacement: '15, 17, 21' },
  // Slate-800 RGB -> Soft Dark Gray RGB
  { regex: /30,\s*41,\s*59/g, replacement: '21, 24, 33' },
  
  // Blue-500 Hex -> Emerald
  { regex: /#3[Bb]82[Ff]6/g, replacement: '#10B981' },
  // Blue-500 RGB -> Emerald RGB
  { regex: /59,\s*130,\s*246/g, replacement: '16, 185, 129' },

  // Specific Corrupted Gradients
  { 
    regex: /linear-gradient\(135deg,\s*#0[Ff]0[Cc]29\s*0%,\s*#0[Ff]172[Aa]\s*40%,\s*#0[Ff]172[Aa]\s*70%,\s*#0[Ff]3460\s*100%\)/g, 
    replacement: 'linear-gradient(135deg, #0F1115 0%, #151821 100%)' 
  },
  { 
    regex: /linear-gradient\(135deg,\s*#0[Ff]3460,\s*#0[Ff]172[Aa]\)/g, 
    replacement: 'linear-gradient(135deg, #0F1115, #151821)' 
  },

  // Variable cleanups
  { regex: /--brand-blue:\s*#[a-zA-Z0-9]+;/g, replacement: '--brand-blue: #10B981;' },
  { regex: /--glow-blue:[^;]+;/g, replacement: '--glow-blue: 0 4px 14px 0 rgba(16, 185, 129, 0.2);' }
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
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
console.log('Blue purge complete!');
