# CampusConnect 🎓

**The AI-Powered Campus Ambassador Growth Platform**

Turn your ambassador cohort into a self-sustaining, AI-verified growth engine — with real-time leaderboards, GitHub scanning, and Gemini-powered proof verification.

🌐 **Live Demo**: [campusconnect-b1bf2.web.app](https://campusconnect-b1bf2.web.app)

---

## ✨ Features

### For Ambassadors
- 🔐 **Dual-role auth** — Sign in via Google or Email/Password as Ambassador or Organization
- 📋 **Task Board** — Browse and complete tasks assigned by your org
- 📸 **AI Proof Verification** — Upload a screenshot; Gemini Vision automatically verifies it matches the task
- 🔥 **Streak System** — Complete tasks daily to multiply your points (5% bonus per streak day)
- 🏆 **Live Leaderboard** — See where you rank among all ambassadors in real time
- ⚡ **GitHub Scanner** — Scan your GitHub profile to get an instant credibility score and AI-powered task recommendations
- 🎴 **Ambassador Card** — Auto-generated shareable card with your stats

### For Organizations (Admins)
- 🛠 **Admin Dashboard** — Create, manage, and delete tasks with custom point values and difficulty multipliers
- 👥 **Ambassador Overview** — See all enrolled ambassadors, their points, streaks, and GitHub handles
- 📊 **ROI Stats** — Estimated referrals and pipeline value calculated from ambassador activity
- 🤖 **AI-Guided Task Creation** — Inline tip helps admins write specific descriptions for stricter Gemini verification

---

## 🧠 How AI Verification Works

When an ambassador submits a screenshot as proof:
1. The image is uploaded to **Firebase Storage**
2. It's sent to **Gemini 2.0 Flash** (multimodal) along with the task title and description
3. Gemini looks at the image and decides: *does this clearly prove the task was completed?*
4. If ✅ verified → points are awarded automatically (with streak multiplier)
5. If ❌ rejected → the ambassador sees the rejection reason and can resubmit

> Without a Gemini API key, all submissions are auto-approved.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication (Google + Email/Password) |
| Database | Firebase Firestore |
| File Storage | Firebase Storage |
| Hosting | Firebase Hosting |
| AI Verification | Google Gemini 2.0 Flash (Vision) |
| GitHub Integration | GitHub REST API |

---

## 🚀 Setup & Installation

### 1. Clone & Install

```bash
git clone https://github.com/Twinkle-yemo/campusconnect.git
cd campusconnect
npm install
```

### 2. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → name it `campusconnect`
3. **Authentication** → Get started → Enable **Email/Password** and **Google**
4. **Firestore Database** → Create database → Start in test mode
5. **Storage** → Get started → Start in test mode
6. **Project Settings** → Your apps → Web → Register app → Copy the config

### 3. Get API Keys

**GitHub Token** (for GitHub Scanner):
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate with `read:user` and `public_repo` scopes

**Gemini API Key** (for AI verification):
- Go to [aistudio.google.com](https://aistudio.google.com)
- Get API key → Copy

### 4. Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GITHUB_TOKEN=your_github_token
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ORG_SECRET_CODE=CAMPUSCONNECT2025
```

> ⚠️ Never commit `.env` to git. It is listed in `.gitignore`.

### 5. Run Locally

```bash
npm run dev
```

### 6. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# → Public directory: dist
# → Single-page app: Yes
# → GitHub deploys: No

npm run build
firebase deploy
```

Your app will be live at `https://your-project-id.web.app`

---

## 👤 Roles & Access

| Role | How to sign up | Access |
|---|---|---|
| **Ambassador** | Sign up normally (no code needed) | Task board, leaderboard, GitHub scanner |
| **Admin / Org** | Sign up with org secret code | Full admin dashboard + all ambassador features |

**Default org secret code**: `CAMPUSCONNECT2025`  
Change it via `VITE_ORG_SECRET_CODE` in your `.env`.

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx              # Auth page (dual-role)
│   ├── AmbassadorDashboard.jsx # Ambassador view
│   └── AdminDashboard.jsx      # Admin/org view
├── components/
│   ├── TaskCard.jsx            # Task submission + Gemini verification
│   ├── GitHubScanner.jsx       # GitHub profile analyzer + AI recommendations
│   └── Leaderboard.jsx         # Real-time leaderboard
├── firebase.js                 # Firebase initialization
└── App.jsx                     # Routing + auth state
```

---

## 📄 License

MIT — free to use, modify, and distribute.