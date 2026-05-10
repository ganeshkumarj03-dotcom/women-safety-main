# 🔐 Step-by-Step Credential Guide

## Part 1: MongoDB Atlas (Database)

### Step 1: Create MongoDB Account
- Go to https://www.mongodb.com/cloud/atlas
- Click **"Sign Up"** (top right)
- Choose **"Sign up with Google"**
- Select your Google account
- Accept terms → Click **"Create Free Account"**

### Step 2: Create First Cluster
- After signing in, click **"Create"**
- Select **"M0 Free"** tier (already selected)
- Choose region: **Asia (closest to you)** 
- Click **"Create Cluster"** (wait 2-3 minutes)

### Step 3: Create Database User
- Left sidebar → **"Database Access"**
- Click **"Add New Database User"** (green button)
- **Username**: `alertuser`
- **Password**: Click **"Generate Secure Password"** 
- Click the copy icon ✓ next to password
- **Save this password!** You'll need it later
- Click **"Add User"**

### Step 4: Allow Access from Anywhere
- Left sidebar → **"Network Access"**
- Click **"Add IP Address"** (green button)
- Click **"Allow access from Anywhere"** (0.0.0.0/0)
- Click **"Confirm"**

### Step 5: Get Connection String
- Left sidebar → **"Clusters"**
- Click the **"Connect"** button on your cluster
- Choose **"Drivers"** (second option)
- You'll see: `mongodb+srv://alertuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
- **Click the copy icon** ✓

### Step 6: Replace Password
The connection string looks like:
```
mongodb+srv://alertuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<password>` with the password you saved earlier:
```
mongodb+srv://alertuser:MyPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Save this full string!** ✅

---

## Part 2: Gmail API (Email Notifications)

### Step 1: Create Google Cloud Project
- Go to https://console.cloud.google.com
- **Top left** → Click dropdown (next to "Google Cloud")
- Click **"Select a Project"**
- Click **"New Project"** (blue button)
- **Project name**: `Emergency Alert App`
- Click **"Create"** (wait 1-2 minutes)

### Step 2: Enable Gmail API
- Top search bar → Type **"Gmail API"**
- Click **"Gmail API"** from results
- Click **"Enable"** (blue button)
- Wait for it to enable

### Step 3: Create Service Account
- Left sidebar → **"Credentials"**
- Click **"+ Create Credentials"** (blue button)
- Choose **"Service Account"**
- Fill in:
  - **Service Account Name**: `emergency-alerts`
  - Click **"Create and Continue"**

### Step 4: Grant Permissions
- **Select a role**: Type **"Editor"** in search
- Click **"Editor"** 
- Click **"Continue"**

### Step 5: Create API Key
- Click **"Create Key"** (blue button)
- Choose **"JSON"**
- Click **"Create"**
- **A JSON file downloads automatically** 📥

### Step 6: Extract Credentials from JSON
- Open the downloaded JSON file
- Find these two values:

```json
{
  "client_email": "emergency-alerts@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nABCD...XYZ\n-----END PRIVATE KEY-----\n"
}
```

- Copy the **client_email** value
- Copy the **private_key** value (including the `-----BEGIN...` and `-----END...` parts)

**Save both!** ✅

---

## Part 3: Cloudinary (Video/Audio Storage)

### Step 1: Create Cloudinary Account
- Go to https://cloudinary.com
- Click **"Sign Up for Free"**
- Sign up with Google
- Verify email

### Step 2: Get API Credentials
- Go to https://cloudinary.com/console
- You'll see your **Cloud Name** at the top
- Copy it

- Scroll down → **API Keys**
- You'll see:
  - **API Key**
  - **API Secret**
- Copy both

**Save all three!** ✅

---

## Part 4: Fill Your `.env` File

Now you have all credentials. Create/edit this file:

**File location**: `backend/.env`

**Content:**

```env
# MongoDB Atlas - From Step 1
MONGODB_URI=mongodb+srv://alertuser:MyPassword123@cluster0.abc123.mongodb.net/emergency-alerts?retryWrites=true&w=majority

# Gmail API - From Step 2
GMAIL_CLIENT_EMAIL=emergency-alerts@your-project.iam.gserviceaccount.com
GMAIL_PASSWORD=-----BEGIN PRIVATE KEY-----\nYourKeyContentHere\n-----END PRIVATE KEY-----\n

# Cloudinary - From Step 3
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Server Port
PORT=5000
```

---

## ✅ Verification Checklist

Before running the server, make sure you have:

- [ ] MongoDB URI (with password replaced)
- [ ] Gmail Client Email
- [ ] Gmail Private Key (with `\n` for newlines)
- [ ] Cloudinary Cloud Name
- [ ] Cloudinary API Key
- [ ] Cloudinary API Secret
- [ ] `.env` file created in `backend/` folder

---

## 🚀 Next: Run the Server

Once `.env` is filled:

```bash
cd backend
npm install
npm start
```

You should see:
```
✅ Connected to MongoDB
Server is running on port 5000
```

🎉 **Success!**
