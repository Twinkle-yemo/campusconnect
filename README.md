# CampusConnect 🎓

**The Structured Campus Ambassador Growth Platform**

Turn your ambassador cohort into an always-on, self-sustaining growth engine.

## Features
- 🔐 Dual-role auth (Ambassador / Organization) via Google or Email
- ⚡ GitHub Profile Scanner — scores ambassadors in under 2 minutes
- 📋 Task Assignment with proof upload (Firebase Storage)
- 🏆 Real-time Leaderboard
- 🎴 Downloadable Ambassador Card (shareable on LinkedIn)
- 📊 ROI Dashboard for organizations

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore + Storage + Hosting)
- **APIs**: GitHub REST API

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/campusconnect
cd campusconnect
npm install
```

### 2. Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → Enable **Authentication** (Google + Email/Password)
3. Create **Firestore** database (test mode)
4. Enable **Storage**
5. Go to Project Settings → Web App → Copy config into `.env`

### 3. Environment Variables
Create `.env` in root:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GITHUB_TOKEN=your_github_token
VITE_ORG_SECRET_CODE=CAMPUSCONNECT2025

**GitHub Token**: github.com → Settings → Developer Settings → Personal Access Tokens → Generate (read:user, public_repo scopes)

### 4. Run Locally
```bash
npm run dev
```

### 5. Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select dist, SPA: yes
npm run build
firebase deploy
```

## Demo Credentials
- **Org code**: `CAMPUSCONNECT2025`
- Create an org account with that code → Admin Dashboard
- Create a normal account → Ambassador Dashboard

## Submission
Live URL: [your-firebase-app.web.app]
GitHub: [github.com/your-username/campusconnect]