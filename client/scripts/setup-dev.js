const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up development environment...');

// Check if .env file exists
const envPath = path.resolve(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  fs.copyFileSync(
    path.resolve(__dirname, '..', '.env.example'),
    envPath
  );
  console.log('✅ Created .env file. Please update with your credentials.');
} else {
  console.log('✅ .env file already exists.');
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  console.log('Trying with npm...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully with npm.');
  } catch (npmError) {
    console.error('❌ Failed to install dependencies with npm:', npmError.message);
    process.exit(1);
  }
}

console.log('\n✅ Setup complete. You can now run the development server with:');
console.log('\npnpm dev   or   npm run dev\n'); 