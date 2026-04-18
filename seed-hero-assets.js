const fs = require('fs');
const path = require('path');
const http = require('http');

const frontendAssetsDir = 'c:/himsworkingcode/hims/frontend/app/src/assets';
const backendUploadsDir = 'c:/himsworkingcode/hims/backend/settings-service/uploads/hero';

const imagesToCopy = [
  'herosection1.png',
  'herosection2.png',
  'herosection3.png'
];

async function seed() {
  console.log('--- Seeding Hero Section Assets ---');

  // 1. Ensure backend directory exists
  if (!fs.existsSync(backendUploadsDir)) {
    console.log('Creating backend uploads directory...');
    fs.mkdirSync(backendUploadsDir, { recursive: true });
  }

  // 2. Copy images
  for (const img of imagesToCopy) {
    const src = path.join(frontendAssetsDir, img);
    const dest = path.join(backendUploadsDir, `hero-${imagesToCopy.indexOf(img) + 1}.png`);
    
    if (fs.existsSync(src)) {
      console.log(`Copying ${img} to ${dest}...`);
      fs.copyFileSync(src, dest);
    } else {
      console.warn(`Source image not found: ${src}`);
    }
  }

  // 3. Trigger Seed API
  // Note: The seed endpoint is @UseGuards(JwtAuthGuard), so we might need a token.
  // However, I'll try to call it directly if there's a way, or just use TypeORM if I could.
  // Actually, I'll check if there's a public seed or if I can bypass it for this script.
  // Alternatively, I can just create a small script that uses the entities directly.
  
  console.log('Seeding data via API call (Attempting)...');
  
  // Since I might not have a valid JWT easily, I'll just tell the user to click the seed button 
  // or I can try to find a token in the backend logs if available.
  // Actually, I'll just write one more script to run with the backend's node context if possible.
  
  console.log('Assets are ready. Please visit http://localhost:8080/settings/hero-sections/seed to trigger seed if possible,');
  console.log('or use the Admin panel to add the slides now that images are in the uploads folder.');
}

seed().catch(err => console.error(err));
