# 🔬 Researcher.Hut

A modern research article sharing platform where users can read, write, and share research insights. Built with Next.js and Express.js, featuring a beautiful UI with dark mode support.

🌐 **Live Website:** [https://researcher-hut.onrender.com](https://researcher-hut.onrender.com)

[![Instagram](https://img.shields.io/badge/Instagram-@research.hut-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/research.hut)

## ✨ Features

### For Readers
- 📖 **Reading Mode** - Distraction-free reading experience with fullscreen support
- 🌙 **Dark Mode** - Easy on the eyes with automatic theme switching
- 🔍 **Search** - Find articles by keywords across titles and content
- ⭐ **Ratings** - Rate articles from 1-5 stars
- 💬 **Comments** - Engage with articles through comments
- 📤 **Share** - Share articles via Twitter, Facebook, LinkedIn, WhatsApp, Telegram, or copy link
- 📄 **Download** - Download articles as PDF or DOCX

### For Writers
- ✍️ **Rich Text Editor** - Write articles with formatting, headings, lists, and more
- 📝 **User Submissions** - Submit articles for admin review
- 👤 **Author Credit** - Add your name or Instagram handle for attribution

### For Admins
- 🔐 **Secure OTP Login** - Email-based OTP authentication
- 📊 **Dashboard** - Manage all articles and pending submissions
- ✅ **Article Approval** - Review and approve user-submitted articles
- 📝 **Create & Edit** - Full control over article management

## 📁 Project Structure

```
researcher-hut/
├── client/                 # Next.js 14 frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── admin/     # Admin dashboard & login
│   │   │   ├── search/    # Search results page
│   │   │   ├── write/     # Article submission
│   │   │   └── [slug]/    # Dynamic article pages
│   │   ├── components/    # React components
│   │   ├── context/       # Auth & Theme contexts
│   │   └── lib/           # API client & utilities
│   └── public/            # Static assets
├── server/                 # Express.js backend
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── routes/        # API routes
│       └── lib/           # Supabase & email utilities
└── supabase/              # Database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Resend account for emails (free tier works)

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Copy your credentials from **Settings > API**:
   - Project URL
   - Anon Key
   - Service Role Key

### 2. Setup Resend (Email Service)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key

### 3. Setup Server

```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=your_admin_email
ADMIN_USERNAME=your_admin_username
RESEND_API_KEY=your_resend_api_key
```

Start the server:
```bash
npm run dev
```

Server runs at `http://localhost:5000`

### 4. Setup Client

```bash
cd client
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Start the client:
```bash
npm run dev
```

Client runs at `http://localhost:3000`

## 🔑 Admin Setup

1. Navigate to `/admin/reset-credentials`
2. Enter admin email (from server .env)
3. Receive OTP via email
4. Set username and password
5. Login at `/admin/login`

## 📝 API Endpoints

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get published articles |
| GET | `/api/posts/search?q=keyword` | Search articles |
| GET | `/api/posts/slug/:slug` | Get article by slug |
| POST | `/api/posts` | Create article (admin) |
| POST | `/api/posts/user` | Submit article (user) |
| PUT | `/api/posts/:id` | Update article |
| DELETE | `/api/posts/:id` | Delete article |
| PATCH | `/api/posts/:id/approve` | Approve article |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:postId` | Get post comments |
| POST | `/api/comments/:postId` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |

### Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ratings/:postId` | Get post ratings |
| GET | `/api/ratings/:postId/user/:userId` | Get user's rating |
| POST | `/api/ratings/:postId` | Add/update rating |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/send-otp` | Send admin login OTP |
| POST | `/api/auth/admin/verify` | Verify OTP and login |
| POST | `/api/auth/admin/reset/send-otp` | Send reset OTP |
| POST | `/api/auth/admin/reset` | Reset credentials |
| POST | `/api/auth/signup/send-otp` | Send signup OTP |
| POST | `/api/auth/signup/verify` | Verify signup |

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with dark mode
- **Tiptap** - Rich text editor
- **Supabase JS** - User authentication

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase JS** - Database operations
- **Resend** - Email delivery
- **bcryptjs** - Password hashing

### Database
- **Supabase (PostgreSQL)** - Database with Row Level Security

## 🌐 Deployment

### Deploy to Render

Both client and server can be deployed to [Render](https://render.com):

**Server:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Add environment variables

**Client:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Set `NEXT_PUBLIC_API_URL` to your server URL

## 📱 Follow Us

Stay updated with the latest research insights:

[![Instagram](https://img.shields.io/badge/Instagram-@research.hut-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/research.hut?igsh=b2dzeW56MHM3bjBn)

---

Made with ❤️ by the Researcher.Hut team
