const fs = require('fs');

// List of files to fix
const filesToFix = [
  'src/components/UserList.tsx',
  'src/components/UserPage.tsx',
  'src/components/UserCard.tsx',
  'src/components/LaunchLink.tsx'
];

function fixFile(filePath) {
  try {
    console.log(`Processing ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace .tsx extension in imports
    content = content.replace(/from\s+['"]([^'"]+)\.tsx['"]/g, 'from "$1"');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed for: ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return false;
  }
}

console.log('Starting to fix specific files...');
let fixedCount = 0;

filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`Done! Fixed ${fixedCount} files.`); 