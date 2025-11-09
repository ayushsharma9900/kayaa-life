# Set Up Vercel Environment Variables

## Option 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project: `kayaa-life`
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string
   - **Environments**: Production, Preview, Development (check all)
5. Click **Save**
6. Redeploy: Go to **Deployments** → Click on latest deployment → Click **Redeploy**

## Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variable
vercel env add MONGODB_URI

# When prompted:
# - Enter your MongoDB connection string
# - Select: Production, Preview, Development (use Space to select, Enter to confirm)

# Redeploy
vercel --prod
```

## Your MongoDB Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kayaalife?retryWrites=true&w=majority
```

## After Setup
Once configured, the admin panel will:
- ✅ Save product updates permanently
- ✅ Persist changes across page refreshes
- ✅ No more "Database not configured" warnings

## Troubleshooting
- If you don't have MongoDB Atlas set up, follow: `MONGODB_ATLAS_SETUP.md`
- If updates still don't work after setup, check Vercel deployment logs for connection errors
