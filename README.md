# 👁️ VISAGE — AI Facial Analytics & Age Estimation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**Visage** is an enterprise-grade AI facial biometric analytics platform. Built with Next.js 16, `@vladmandic/face-api`, Three.js (React Three Fiber), and Tailwind CSS, Visage provides real-time facial age estimation, gender identification, emotion recognition, 68-point facial landmark detection, and interactive 3D holographic rendering.

---

## 🏛️ Project Architecture & Format Structure

```
visage/
├── public/                     # Static assets & client-accessible resources
│   ├── favicon.ico
│   ├── manifest.json           # PWA web manifest definition
│   └── models/                 # Pre-trained face-api Neural Network models
│       ├── ssd_mobilenetv1_model-*
│       ├── face_landmark_68_model-*
│       ├── face_expression_model-*
│       └── age_gender_model-*
├── scripts/                    # Automation and utility scripts
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── layout.tsx          # Root layout with providers & global fonts
│   │   ├── page.tsx            # Hero Landing Page & Features overview
│   │   ├── globals.css         # Global design system tokens & custom utilities
│   │   ├── scan/               # Live Real-time Camera & File Upload scanner
│   │   │   └── page.tsx
│   │   ├── history/            # Biometric scan history & analytics log
│   │   │   └── page.tsx
│   │   ├── login/              # Secure User Authentication (Sign In)
│   │   │   └── page.tsx
│   │   ├── signup/             # User Account Creation
│   │   │   └── page.tsx
│   │   └── settings/           # User preferences & model configuration
│   │       └── page.tsx
│   ├── components/             # Modular React UI Components
│   │   ├── 3d/                 # Three.js / R3F Canvas components
│   │   │   └── HologramFace.tsx# 3D interactive holographic face point cloud
│   │   ├── auth/               # Auth transitions & biometric splash screens
│   │   │   └── PostLoginTransition.tsx
│   │   ├── layout/             # Application structural wrappers
│   │   │   ├── Navbar.tsx      # Global responsive navigation bar
│   │   │   ├── Footer.tsx      # Enterprise site footer
│   │   │   └── ProtectedRoute.tsx # Auth protection route wrapper
│   │   └── scan/               # Scanner specific UI elements
│   │       ├── CameraFeed.tsx  # WebRTC live video canvas analyzer
│   │       ├── ImageUploader.tsx# Drag-and-drop image file analyzer
│   │       ├── FaceCard.tsx    # Biometric breakdown & detail card
│   │       ├── EmotionChart.tsx# Visual emotion confidence breakdown
│   │       └── ScanLoader.tsx  # Neural network initialization loader
│   ├── context/                # React Global State Providers
│   │   ├── AuthContext.tsx     # Firebase Authentication state manager
│   │   └── ThemeContext.tsx    # Light / Dark / Cyberpunk theme switcher
│   ├── lib/                    # Core utilities & external integrations
│   │   ├── faceApi.ts          # Neural network loader & canvas drawing logic
│   │   ├── firebase.ts         # Firebase App initialization & SDK instances
│   │   └── scanStorage.ts      # IndexedDB / Local Storage scan persistence
│   └── types/                  # Shared TypeScript interfaces & types
│       └── index.ts            # ScanResult, FaceDetection, User Profile types
├── AGENTS.md                   # Next.js system agent guidelines & rules
├── APP_GUIDELINES.md           # Master guide for converting to Native Mobile & App Packaging
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js compiler & webpack configuration
├── package.json                # Project dependencies & scripts
├── postcss.config.mjs          # PostCSS configuration for TailwindCSS v4
└── tsconfig.json               # Strict TypeScript configuration
```

---

## ⚡ Key Features

- 🎯 **Real-time Age & Gender Estimation**: Sub-second client-side inference using SSD MobileNet V1 & ResNet models.
- 🎭 **Emotion Confidence Analysis**: 7 core emotion categories (Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral).
- 🌌 **3D Holographic Visualizer**: Cyberpunk-style interactive 3D point cloud mesh rendering real-time landmarks using Three.js and Framer Motion.
- 📊 **Scan History & Analytics**: Local and Firebase storage for history tracking and export capabilities.
- 📱 **Cross-Platform Readiness**: Designed for seamless conversion into PWA (Progressive Web App) and Native Mobile Apps via Capacitor.
- 🎨 **Executive Cyberpunk Aesthetics**: Custom dark-mode neon glassmorphism UI with smooth spring micro-animations.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **pnpm** or **yarn**

### 2. Installation
Clone the repository and install project dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/visage.git

# Navigate into project directory
cd visage

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and configure Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Running Locally
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 App Conversion & Mobile Packaging

For comprehensive instructions on transforming Visage into a native mobile app (iOS / Android) or Progressive Web App (PWA), view the [APP_GUIDELINES.md](file:///d:/antigravity/visage/APP_GUIDELINES.md) document.

---

## 📄 License & Standards

This project follows enterprise coding standards, strict TypeScript type checking, modular component architecture, and responsive UI design rules.
