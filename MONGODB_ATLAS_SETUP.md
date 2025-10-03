# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

## 2. Create a Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "kayaalife-cluster")

## 3. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set user privileges to "Read and write to any database"

## 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
4. For production, add your specific IP addresses

## 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## 6. Update Your .env File
Replace the placeholders in your `.env` file:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/kayaalife?retryWrites=true&w=majority
```

Example:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@kayaalife-cluster.abc123.mongodb.net/kayaalife?retryWrites=true&w=majority
```

## 7. Test Connection
Run your backend server:
```bash
cd backend
npm run dev
```

You should see "MongoDB Connected: <cluster-address>" in the console.

## 8. Seed Your Data (Optional)
If you have existing data to migrate:
```bash
npm run seed
npm run seed:categories
```

## Security Notes
- Never commit your actual MongoDB URI to version control
- Use environment variables for sensitive data
- Consider using MongoDB Atlas IP whitelisting in production
- Regularly rotate your database passwords