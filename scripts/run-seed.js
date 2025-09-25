const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting database seeding...\n');

try {
  // Run the TypeScript seed script using ts-node
  const scriptPath = path.join(__dirname, 'seed-products.ts');
  
  // Check if we can run with tsx (if available) or ts-node
  try {
    execSync(`npx tsx "${scriptPath}"`, { 
      stdio: 'inherit', 
      cwd: process.cwd() 
    });
  } catch (error) {
    // Fallback to ts-node
    execSync(`npx ts-node "${scriptPath}"`, { 
      stdio: 'inherit', 
      cwd: process.cwd() 
    });
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n💡 You can now start your development server with: npm run dev');
  
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  process.exit(1);
}