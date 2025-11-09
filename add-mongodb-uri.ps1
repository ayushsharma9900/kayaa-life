# PowerShell script to add MONGODB_URI to Vercel
# Run this script to configure your Vercel environment

Write-Host "=== Vercel Environment Variable Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if user has MongoDB Atlas URI
Write-Host "Do you have a MongoDB Atlas connection string?" -ForegroundColor Yellow
Write-Host "If not, please set one up first using MONGODB_ATLAS_SETUP.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Enter your MongoDB connection string:" -ForegroundColor Green
Write-Host "(Format: mongodb+srv://username:password@cluster.mongodb.net/kayaalife?retryWrites=true&w=majority)" -ForegroundColor Gray
Write-Host ""

$mongoUri = Read-Host "MONGODB_URI"

if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    Write-Host "❌ No URI provided. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Adding MONGODB_URI to Vercel environment variables..." -ForegroundColor Cyan

# Add to all environments
$environments = @("production", "preview", "development")

foreach ($env in $environments) {
    Write-Host "Adding to $env..." -ForegroundColor Gray
    echo $mongoUri | vercel env add MONGODB_URI $env
}

Write-Host ""
Write-Host "✅ Environment variable added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: vercel --prod" -ForegroundColor White
Write-Host "2. Or push to GitHub to trigger auto-deployment" -ForegroundColor White
Write-Host ""
Write-Host "After deployment, your admin panel product updates will work!" -ForegroundColor Cyan
