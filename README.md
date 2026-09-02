👁️ VISAGE — AI Facial Analytics & Age Estimation Platform

Visage is an AI-powered facial analytics platform designed for real-time facial analysis.

It provides face detection, age estimation, gender confidence analysis, emotion recognition, 68-point facial landmark detection, and interactive 3D facial visualization.

🌐 Live Demo

https://visage-web.netlify.app

✨ Key Features
🎯 Real-time face detection
👥 Multi-face detection
🎂 Age estimation
👤 Gender confidence analysis
🎭 7-category emotion analysis
📍 68-point facial landmark detection
🌌 Interactive 3D holographic visualization
📷 Live camera scanning
🖼️ Image upload analysis
📊 Scan history and analytics
🔐 Firebase authentication
⚙️ User settings
📱 PWA and mobile-app readiness
🎨 Responsive dark cyberpunk-style interface
🛠️ Technology Stack
Next.js
React
TypeScript
Tailwind CSS
@vladmandic/face-api
Three.js / React Three Fiber
Framer Motion
Firebase
IndexedDB / Local Storage
Capacitor
🏗️ Project Structure
visage/
├── public/
│   └── models/
│
├── scripts/
│
├── src/
│   ├── app/
│   │   ├── scan/
│   │   ├── history/
│   │   ├── login/
│   │   ├── signup/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── 3d/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── scan/
│   │
│   ├── context/
│   ├── lib/
│   └── types/
│
├── .gitignore
├── capacitor.config.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
🧠 How It Works
Camera / Image Upload
        ↓
   Face Detection
        ↓
 ┌──────┼──────────┐
 ↓      ↓          ↓
Age   Gender    Emotions
        ↓
Facial Landmarks
        ↓
Analysis Results
        ↓
Visualization & History
🚀 Getting Started
Prerequisites
Node.js v18.17.0 or higher
npm, pnpm, or yarn
Installation
git clone https://github.com/msashank2007/Visage.git
cd Visage
npm install
Environment Variables

Create a .env.local file in the project root:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

Never commit .env.local or private credentials to GitHub.

Run Locally
npm run dev

Open:

http://localhost:3000
📦 Production
npm run build
npm run start
📱 Mobile & PWA

Visage is structured for future Progressive Web App and native mobile deployment using Capacitor.

🔒 Privacy

Facial analysis is performed using client-side AI models. The project also supports local storage and Firebase-based persistence for scan-related functionality.

📄 License

No open-source license is currently specified for this repository.

Live Demo: https://visage-web.netlify.app
GitHub: https://github.com/msashank2007/Visage
