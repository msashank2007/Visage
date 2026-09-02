'use client';

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleUserInfo {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

interface Props {
  onSuccess: (info: GoogleUserInfo) => void;
  onError: (msg: string) => void;
  loading: boolean;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const IS_CONFIGURED =
  Boolean(GOOGLE_CLIENT_ID) && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

// ── Real Google OAuth button (when client ID is set) ────────────────────────
function RealGoogleButton({ onSuccess, onError, loading }: Props) {
  const [fetching, setFetching] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setFetching(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info: GoogleUserInfo = await res.json();
        onSuccess(info);
      } catch {
        onError('Failed to fetch Google profile. Please try again.');
      } finally {
        setFetching(false);
      }
    },
    onError: () => onError('Google Sign-In was cancelled or failed.'),
    flow: 'implicit',
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading || fetching}
      className="btn-futuristic-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {fetching ? (
        <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
          <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9-1.4-2.3z" />
          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
        </svg>
      )}
      <span>{fetching ? 'Connecting...' : 'Sign in with Google'}</span>
    </button>
  );
}

// ── Setup instructions shown when client ID is not configured ───────────────
function SetupGoogleButton({ onError }: Pick<Props, 'onError'>) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowInstructions((s) => !s)}
        className="btn-futuristic-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
          <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9-1.4-2.3z" />
          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
        </svg>
        <span>Sign in with Google</span>
        <span className="ml-auto text-[9px] text-amber-400 font-mono border border-amber-500/40 px-1.5 py-0.5 rounded-full">Setup Required</span>
      </button>

      {showInstructions && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/30 text-[11px] text-amber-200 space-y-2">
          <p className="font-bold text-amber-300">🔑 Google OAuth Setup (2 min)</p>
          <ol className="space-y-1 text-slate-300 list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Cloud Console → Credentials</a></li>
            <li>Create OAuth 2.0 Client ID → Web application</li>
            <li>Add <code className="bg-slate-800 px-1 rounded">http://localhost:3000</code> to Authorized origins</li>
            <li>Copy the Client ID</li>
            <li>Add to <code className="bg-slate-800 px-1 rounded">.env.local</code>:<br />
              <code className="bg-slate-800 px-1 rounded text-cyan-300">NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id-here</code>
            </li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      )}
    </div>
  );
}

// ── Exported component — auto-selects real vs setup ──────────────────────────
export default function GoogleSignInButton({ onSuccess, onError, loading }: Props) {
  if (IS_CONFIGURED) {
    return <RealGoogleButton onSuccess={onSuccess} onError={onError} loading={loading} />;
  }
  return <SetupGoogleButton onError={onError} />;
}
