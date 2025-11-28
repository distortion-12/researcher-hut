# Researcher.Hut - Monorepo Deployment

## Deploy to Railway (Recommended - Free $5 credit/month)

### Step 1: Push to GitHub
```bash
cd c:\Users\ramch\Desktop\Final\2.0
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/researcher-hut.git
git push -u origin main
```

### Step 2: Deploy Server on Railway
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repo
4. Click **"Add Service"** → **"GitHub Repo"** (same repo)
5. Configure the **Server**:
   - Click on the service → **Settings**
   - Set **Root Directory**: `server`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm start`
6. Add **Variables** tab:
   ```
   PORT=5000
   SUPABASE_URL=https://pgvoioyyriaakaeenmsb.supabase.co
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ADMIN_EMAIL=falsedistortion12@gmail.com
   ADMIN_USERNAME=false.distortion
   SMTP_EMAIL=falsedistortion12@gmail.com
   SMTP_PASSWORD=your_gmail_app_password
   CLIENT_URL=https://your-client.up.railway.app
   ```
7. Copy the server URL from **Settings** → **Domains**

### Step 3: Deploy Client on Railway
1. In the same project, click **"Add Service"** → **"GitHub Repo"**
2. Select your repo again
3. Configure the **Client**:
   - Set **Root Directory**: `client`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm start`
4. Add **Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pgvoioyyriaakaeenmsb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   NEXT_PUBLIC_API_URL=https://your-server.up.railway.app/api
   NEXT_PUBLIC_ADMIN_EMAIL=falsedistortion12@gmail.com
   NEXT_PUBLIC_ADMIN_USERNAME=false.distortion
   ```
5. Generate a domain in **Settings** → **Domains**

### Step 4: Update Server CORS
Go back to server service → Variables → Update `CLIENT_URL` with client domain

---

## Alternative: Deploy to Render

### Server (Web Service)
1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables

### Client (Web Service)
1. **New** → **Web Service**
2. Connect same GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables

---

## Quick Comparison

| Platform | Server | Client | Free Tier | Ease |
|----------|--------|--------|-----------|------|
| Railway | ✅ | ✅ | $5 credit | ⭐⭐⭐⭐⭐ |
| Render | ✅ | ✅ | 750 hrs/mo | ⭐⭐⭐⭐ |
| Fly.io | ✅ | ✅ | 3 VMs free | ⭐⭐⭐ |
| Vercel + Railway | Separate | ✅ | Both free | ⭐⭐⭐⭐ |
