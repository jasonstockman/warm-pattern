const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  console.log(`Checking directory: ${dir}`);
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filepath = path.join(dir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.isDirectory() && !filepath.includes('node_modules')) {
        filelist = walkSync(filepath, filelist);
      } else if (stats.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.js'))) {
        filelist.push(filepath);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return filelist;
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace .tsx extension in imports and exports
    content = content.replace(/from\s+['"]([^'"]+)\.tsx['"]/g, 'from "$1"');
    content = content.replace(/import\s+['"]([^'"]+)\.tsx['"]/g, 'import "$1"');
    content = content.replace(/export\s+.*\s+from\s+['"]([^'"]+)\.tsx['"]/g, match => {
      return match.replace(/\.tsx['"]/, '"');
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err.message);
  }
  
  return false;
}

console.log('Starting to fix imports...');

// Get all .tsx, .ts, and .js files recursively
const srcFiles = fs.existsSync('./src') ? walkSync('./src') : [];
console.log(`Found ${srcFiles.length} files in src directory`);

const pagesFiles = fs.existsSync('./pages') ? walkSync('./pages') : [];
console.log(`Found ${pagesFiles.length} files in pages directory`);

const allFiles = [...srcFiles, ...pagesFiles];
console.log(`Total files to process: ${allFiles.length}`);

// Fix imports in each file
let fixedCount = 0;
allFiles.forEach(filePath => {
  if (fixImportsInFile(filePath)) {
    fixedCount++;
  }
});

console.log(`Done! Fixed ${fixedCount} files.`); 