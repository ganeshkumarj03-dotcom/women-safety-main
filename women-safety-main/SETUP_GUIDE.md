# Setup Guide - Free Stack

## 🧩 Tech Stack
- **Backend**: Node.js / Express
- **Database**: MongoDB Atlas (Free)
- **Notifications**: Gmail API (Free)
- **Hosting**: Railway / Render / Fly.io (Free)

---

## 1. MongoDB Atlas Setup (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Sign Up"** → Create account with Google
3. Click **"Create"** → Free tier database
4. Choose region closest to you → **Create Cluster**
5. Go to **Database Access** → **Add New Database User**
   - Username: `alertuser`
   - Password: Generate strong password → Copy it
6. Go to **Network Access** → **Add IP Address** → Allow from Anywhere (0.0.0.0/0)
7. Click **"Connect"** → Choose **"Drivers"** → Copy connection string
8. Replace `<password>` with your password
9. Copy to `.env`:
   ```
   MONGODB_URI=mongodb+srv://alertuser:your_password@cluster0.xxxxx.mongodb.net/emergency-alerts?retryWrites=true&w=majority
   ```

**Example:**
```
mongodb+srv://alertuser:MyPassword123@cluster0.abc123.mongodb.net/emergency-alerts?retryWrites=true&w=majority
```

---

## 2. Gmail API Setup (5 minutes)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (top left dropdown → New Project)
3. Name it: `Emergency Alert App` → Create
4. Search **"Gmail API"** → Click it → **Enable**
5. Go to **Credentials** (left sidebar)
6. Click **"+ Create Credentials"** → **Service Account**
7. Fill in:
   - Service Account Name: `emergency-alerts`
   - Click **Create and Continue**
8. Grant roles:
   - Select **Editor** role → **Continue**
   - Click **"Create Key"** → **JSON** → **Create**
9. JSON file downloads automatically
10. Copy these values to `.env`:
    ```
    GMAIL_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
    GMAIL_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n
    ```

**Important**: Make sure the private key includes the `\n` characters for newlines!

---

## 3. Add to `.env` file (in `backend/` folder)

Create or update `.env`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://alertuser:your_password@cluster0.xxxxx.mongodb.net/emergency-alerts?retryWrites=true&w=majority

# Gmail Configuration
GMAIL_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GMAIL_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Port
PORT=5000
```

---

## 4. Install Dependencies

```bash
cd backend
npm install
```

---

## 5. Run Locally

```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 🚀 Deploy for FREE

Choose one of these free hosting options:

### Option A: Railway (Easiest - Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **Deploy from GitHub repo**
4. Select your repo → **emergency-alert-assistant**
5. Go to **Variables** → Add all `.env` variables
6. Click **"Deploy"** → Done! 🎉
7. Get your URL from **Deployments**

**Cost**: FREE (free tier includes $5 credit/month)

---

### Option B: Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **Web Service**
4. Select your GitHub repo
5. Configuration:
   - Build Command: `npm install`
   - Start Command: `cd backend && npm start`
   - Add all `.env` variables
6. Click **"Create Web Service"** → Done! 🎉

**Cost**: FREE tier (spins down after 15 min inactivity)

---

### Option C: Fly.io

1. Go to [fly.io](https://fly.io)
2. Sign up → Install CLI
3. In project folder:
   ```bash
   flyctl launch
   ```
4. Answer prompts, set region
5. Add env variables:
   ```bash
   flyctl secrets set MONGODB_URI="your_uri"
   flyctl secrets set GMAIL_CLIENT_EMAIL="your_email"
   ```
6. Deploy:
   ```bash
   flyctl deploy
   ```

**Cost**: FREE tier (3 shared VMs, 3 GB storage)

---

## Summary

| Service | Cost | Limit |
|---------|------|-------|
| MongoDB Atlas | **FREE** | 512 MB storage (enough for thousands of alerts) |
| Gmail API | **FREE** | Unlimited emails |
| Cloudinary | **FREE** | 10 GB/month |
| Railway | **FREE** | $5/month credit (plenty for hackathon) |
| Render | **FREE** | Free tier (sleeps after inactivity) |
| Fly.io | **FREE** | 3 shared VMs |

**Total Cost: $0 🎉**
