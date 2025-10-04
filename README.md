# KaayaLife - Beauty E-commerce Platform

A modern beauty e-commerce platform built with Next.js 15, TypeScript, and MongoDB.

## Features

- 🛍️ Dynamic product catalog with categories
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔍 Advanced product search and filtering
- 🛒 Shopping cart and wishlist functionality
- 👤 User authentication and account management
- 📱 Mobile-responsive design
- ⚡ Fast performance with Next.js 15
- 🗄️ MongoDB database integration
- 🎯 Admin panel for product and category management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Icons**: Heroicons
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kayaalife
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NEXTAUTH_SECRET`: A secure random string
   - `NEXTAUTH_URL`: Your production URL

4. Deploy!

## API Routes

- `GET /api/categories` - Fetch all categories
- `GET /api/products` - Fetch all products
- `POST /api/products` - Create new product (admin)
- `PUT /api/products` - Update product (admin)
- `DELETE /api/products` - Delete product (admin)

## Project Structure

```
src/
├── app/                 # Next.js 15 app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin panel pages
│   └── [category]/     # Dynamic category pages
├── components/         # Reusable components
│   ├── admin/         # Admin-specific components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.