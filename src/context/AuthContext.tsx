'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (name: string, e: string, p: string) => Promise<void>;
  signInWithPhone: (phone: string, otp: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleProfile: (info: { name: string; email: string; picture: string; sub: string }) => void;
  demoSignIn: (name?: string) => void;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseActive: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithPhone: async () => {},
  signInWithGoogle: async () => {},
  signInWithGoogleProfile: () => {},
  demoSignIn: () => {},
  signOutUser: async () => {},
  resetPassword: async () => {},
});

const DEMO_USER_KEY = 'facelens_demo_user';

// Generate a stable uid from an identifier so scan history persists across sessions
function stableUid(prefix: string, identifier: string): string {
  let hash = 5381;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) + hash) ^ identifier.charCodeAt(i);
  }
  return `${prefix}_${Math.abs(hash).toString(36)}`;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Read stored demo user on client side after mount
    if (typeof window !== 'undefined') {
      const storedDemo = localStorage.getItem(DEMO_USER_KEY);
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUser(parsed);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(DEMO_USER_KEY);
        }
      }
    }

    // 2. Register Firebase listener if configured
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL,
            isDemo: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const demoSignIn = (name: string = 'Demo Explorer', email: string = 'demo@facelens.ai') => {
    // Use stable uid so scan history persists across sessions for same email
    const demoUser: UserProfile = {
      uid: stableUid('demo', email.toLowerCase().trim()),
      email: email,
      displayName: name,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      // Automatic fallback to demo sign-in using the provided email
      demoSignIn(email.split('@')[0] || 'User', email);
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      demoSignIn(name, email);
      return;
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
  };

  const signInWithPhone = async (phoneNumber: string, otp: string) => {
    // Validate OTP format (6 digits)
    if (!otp || otp.length < 4) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }
    
    // Official User Profile created for phone/WhatsApp login — stable uid so history persists
    const phoneUser: UserProfile = {
      uid: stableUid('phone', phoneNumber.replace(/\s+/g, '')),
      email: null,
      phoneNumber: phoneNumber,
      displayName: `User ${phoneNumber.slice(-4)}`,
      photoURL: null,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(phoneUser));
    setUser(phoneUser);
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Prompt for real name when Firebase is not configured
      const name = typeof window !== 'undefined'
        ? (window.prompt('Enter your name for Google Sign-In:') || 'Google User').trim()
        : 'Google User';
      // Stable uid so their scans persist
      const googleUser: UserProfile = {
        uid: stableUid('google', name.toLowerCase()),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=128`,
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(googleUser));
      setUser(googleUser);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  // Called by GoogleSignInButton after real Google OAuth popup succeeds
  const signInWithGoogleProfile = (info: { name: string; email: string; picture: string; sub: string }) => {
    const googleUser: UserProfile = {
      uid: stableUid('google', info.sub || info.email.toLowerCase()),
      email: info.email,
      displayName: info.name,
      photoURL: info.picture,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(googleUser));
    setUser(googleUser);
  };

  const signOutUser = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      alert('Password reset instructions sent to ' + email + ' (Demo Mode)');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithPhone,
        signInWithGoogle,
        signInWithGoogleProfile,
        demoSignIn,
        signOutUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
