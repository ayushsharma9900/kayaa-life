# ⚠️ IMPORTANT: Update MongoDB URI in Vercel

I've added a placeholder `MONGODB_URI` to Vercel, but it's set to `mongodb://localhost:27017/kayaalife` which **won't work in production**.

## You MUST update it with your actual MongoDB Atlas connection string

### Option 1: Via Vercel CLI
```bash
# Remove the placeholder
vercel env rm MONGODB_URI production
vercel env rm MONGODB_URI preview
vercel env rm MONGODB_URI development

# Add your real MongoDB Atlas URI
vercel env add MONGODB_URI production
# Then paste your actual MongoDB Atlas connection string

vercel env add MONGODB_URI preview
# Paste again

vercel env add MONGODB_URI development
# Paste again
```

### Option 2: Via Vercel Dashboard (Easier)
1. Go to: https://vercel.com/ayushsharma9900s-projects/kayaalife/settings/environment-variables
2. Find `MONGODB_URI` and click "Edit" for each environment
3. Replace with your MongoDB Atlas connection string from `backend/.env`
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/kayaalife?retryWrites=true&w=majority`

### After updating, redeploy:
```bash
vercel --prod
```

Or wait for the next git push which will auto-deploy.
