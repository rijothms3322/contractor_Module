const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

// Helper to recursively replace string in files
function replaceInFiles(dir, searchValue, replaceValue) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInFiles(filePath, searchValue, replaceValue);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.json')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(searchValue)) {
        content = content.split(searchValue).join(replaceValue);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated paths in: ${filePath}`);
      }
    }
  }
}

// Rename _next folder to next
const oldPath = path.join(outDir, '_next');
const newPath = path.join(outDir, 'next');

if (fs.existsSync(oldPath)) {
  if (fs.existsSync(newPath)) {
    fs.rmSync(newPath, { recursive: true, force: true });
  }
  fs.renameSync(oldPath, newPath);
  console.log('Renamed _next folder to next successfully.');
} else {
  console.log('No _next folder found.');
}

// Replace all "_next" references
replaceInFiles(outDir, '/_next/', '/next/');
replaceInFiles(outDir, '_next/', 'next/');
console.log('Path replacement completed!');
