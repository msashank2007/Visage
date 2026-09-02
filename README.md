# 👁️ Visage — AI Facial Analytics & Age Estimation Platform

<p align="center">
  <strong>Real-Time Facial Analysis • AI-Powered Insights • Privacy-First Processing</strong>
</p>

<p align="center">
  <a href="https://visage-web.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Visage-00F2FE?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/msashank2007/Visage">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.0-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Database-FFCA28?style=flat-square&logo=firebase" alt="Firebase">
</p>

---

## 🌐 Live Demo

**Try Visage online:**

👉 https://visage-web.netlify.app

**Source Code:**

👉 https://github.com/msashank2007/Visage

---

## 📌 Overview

**Visage** is an AI-powered facial analytics platform designed for real-time facial analysis through a modern web interface.

The application combines browser-based computer vision, interactive visualization, authentication, scan history, and responsive UI components into a unified facial analytics experience.

Visage uses `@vladmandic/face-api` for facial analysis and Three.js / React Three Fiber for interactive 3D visualization.

### Core capabilities include:

- Real-time face detection
- Age estimation
- Gender estimation with confidence
- Facial expression / emotion analysis
- 68-point facial landmark detection
- Multiple-face analysis
- Live camera analysis
- Image upload analysis
- Facial analytics result cards
- Emotion confidence visualization
- Scan history
- Firebase authentication and database integration
- Interactive 3D holographic facial visualization
- Responsive dark glassmorphism interface
- PWA and native mobile application readiness

---

# ✨ Key Features

## 🎯 Real-Time Facial Analysis

Visage can analyze faces from a live camera feed and provide facial analytics through client-side AI models.

The analysis includes:

- Face detection
- Estimated age
- Estimated gender
- Gender confidence
- Facial expressions
- Facial landmarks

---

## 🎭 Emotion Analysis

Visage supports seven core facial expression categories:

| Emotion | Description |
|---|---|
| 😊 Happy | Happiness expression |
| 😢 Sad | Sadness expression |
| 😠 Angry | Anger expression |
| 😲 Surprised | Surprise expression |
| 😨 Fearful | Fear expression |
| 🤢 Disgusted | Disgust expression |
| 😐 Neutral | Neutral expression |

Emotion confidence values can be displayed through the application's visual analytics interface.

---

## 👤 68-Point Facial Landmarks

The facial landmark model detects **68 facial landmark points**.

These landmarks can be used to represent important facial regions such as:

- Eyes
- Eyebrows
- Nose
- Mouth
- Jawline
- Facial contour

The landmark data also supports the application's visual facial representation.

---

## 👥 Multi-Face Detection

Visage is designed to analyze multiple faces within the same image or camera frame.

Each detected face can be presented with its own analytical information, including:

- Estimated age
- Gender
- Confidence
- Emotion data
- Facial landmarks

---

## 📷 Camera & Image Upload

Visage supports two primary analysis workflows:

### Live Camera

Use the device camera to perform real-time facial analysis.

### Image Upload

Upload an image through the application's image uploader and analyze the detected faces.

---

## 🌌 3D Holographic Visualization

Visage includes an interactive 3D visual experience powered by:

- Three.js
- React Three Fiber
- React Three Drei

The application includes a holographic facial visualization concept based on facial landmark information.

This provides a futuristic visualization layer on top of the underlying facial analytics.

---

## 📊 Scan History

Analyzed scans can be stored and reviewed through the application's history system.

The history interface supports viewing previous scan records and accessing detailed scan information.

Storage functionality is implemented through the application's scan storage utilities and Firebase integration.

---

## 🔐 Authentication

Visage includes authentication-related pages and application state management.

The project includes:

- Login
- Signup
- Protected routes
- Firebase Authentication integration
- Authentication state management

Authenticated users can access protected application functionality.

---

## ☁️ Firebase Integration

Firebase is used for application services including authentication and database functionality.

The project includes a dedicated Firebase integration layer:

```text
src/lib/firebase.ts
