# Deployment Guide for Researcher.Hut

## Prerequisites
- GitHub account
- Supabase project (already set up)
- Gmail App Password for email OTP

---

## Step 1: Push to GitHub

```bash
# In the project root (c:\Users\ramch\Desktop\Final\2.0)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/researcher-hut.git
git push -u origin main
```

---

## Step 2: Deploy Server to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Choose the **server** folder as root directory
5. Add environment variables:

```
PORT=5000
SUPABASE_URL=https://pgvoioyyriaakaeenmsb.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=falsedistortion12@gmail.com
ADMIN_USERNAME=false.distortion
SMTP_EMAIL=falsedistortion12@gmail.com
SMTP_PASSWORD=your_gmail_app_password
CLIENT_URL=https://your-client-domain.vercel.app
```

6. Railway will auto-deploy. Copy the generated URL (e.g., `https://researcher-hut-server.railway.app`)

---

## Step 3: Deploy Client to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import your repository
3. Set **Root Directory** to `client`
4. Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://pgvoioyyriaakaeenmsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-server.railway.app/api
NEXT_PUBLIC_ADMIN_EMAIL=falsedistortion12@gmail.com
NEXT_PUBLIC_ADMIN_USERNAME=false.distortion
```

5. Click **Deploy**

---

## Step 4: Update CORS

After deploying, update the server's `CLIENT_URL` environment variable in Railway with your Vercel URL.

---

## Alternative: Deploy Server to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add the same environment variables as above

---

## Environment Variables Summary

### Server (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (Railway sets this automatically) |
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_ANON_KEY | Supabase anon/public key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key |
| ADMIN_EMAIL | Admin email for OTP |
| ADMIN_USERNAME | Default admin username |
| SMTP_EMAIL | Gmail address for sending OTP |
| SMTP_PASSWORD | Gmail App Password |
| CLIENT_URL | Your Vercel client URL |

### Client (.env)
| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon/public key |
| NEXT_PUBLIC_API_URL | Your Railway/Render server URL + /api |
| NEXT_PUBLIC_ADMIN_EMAIL | Admin email display |
| NEXT_PUBLIC_ADMIN_USERNAME | Admin username display |

---

## Troubleshooting

### CORS Errors
- Make sure `CLIENT_URL` in server matches your Vercel URL exactly
- Include `https://` in the URL

### Email Not Sending
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail account

### Database Errors
- Ensure all tables exist in Supabase
- Check RLS policies are configured correctly
