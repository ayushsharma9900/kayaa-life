# Vercel Deployment with MongoDB Atlas

## 1. Set Up MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free M0 cluster
3. Add database user with read/write permissions
4. Whitelist all IPs (0.0.0.0/0) for Vercel
5. Get connection string

## 2. Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

## 3. Add Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/kayaalife?retryWrites=true&w=majority`

## 4. Redeploy
```bash
vercel --prod
```

Your app will be live with MongoDB Atlas backend!