# Researcher.Hut

A modern research article sharing platform built with Next.js (client) and Express.js (server), using Supabase as the database.

## 📁 Project Structure

```
researcher-hut/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js 14 App Router pages
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context providers
│   │   └── lib/           # Utility functions and API client
│   └── public/            # Static assets
├── server/                 # Express.js backend API
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── routes/        # API route definitions
│       └── lib/           # Database and utilities
└── supabase/              # Database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and keys from Settings > API

### 2. Setup Server

```bash
cd server

# Install dependencies
npm install

# Create environment file (.env) with these variables:
# PORT=5000
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# ADMIN_EMAIL=your_admin_email
# ADMIN_USERNAME=your_admin_username
# SMTP_EMAIL=your_smtp_email
# SMTP_PASSWORD=your_smtp_password

# Start development server
npm run dev
```

The server will run at `http://localhost:5000`

### 3. Setup Client

```bash
cd client

# Install dependencies
npm install

# Create environment file (.env) with these variables:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email
# NEXT_PUBLIC_ADMIN_USERNAME=your_admin_username

# Start development server
npm run dev
```

The client will run at `http://localhost:3000`

## 🔑 Admin Setup

1. Navigate to `http://localhost:3000/admin/reset-credentials`
2. Enter your admin email
3. Receive OTP via email
4. Set your username and password
5. Login at `http://localhost:3000/admin/login`

## 📝 API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:slug` - Get post by slug
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/posts/:postId/comments` - Add comment

### Ratings
- `GET /api/posts/:postId/ratings` - Get post ratings
- `POST /api/posts/:postId/ratings` - Add/update rating
- `GET /api/posts/:postId/ratings/user/:userId` - Get user's rating

### Auth
- `POST /api/auth/send-otp` - Send admin OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/reset-send-otp` - Send reset OTP
- `POST /api/auth/reset-credentials` - Reset admin credentials
- `GET /api/auth/admin-email` - Get current admin email

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `POST /api/users` - Create new user

## 🛠 Tech Stack

### Client
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Tiptap** - Rich text editor
- **Supabase JS** - Authentication only

### Server
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase JS** - Database operations
- **CORS** - Cross-origin support

### Database
- **Supabase (PostgreSQL)** - Database and authentication

## 📄 License

MIT License
