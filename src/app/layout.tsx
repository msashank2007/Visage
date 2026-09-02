import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GoogleProvider } from '@/components/auth/GoogleProvider';

export const metadata: Metadata = {
  title: 'FaceLens AI | Next-Gen AI Face Analytics',
  description: 'Real-time client-side face analytics platform powered by TensorFlow.js and face-api. Detect multi-face age, gender, and 7-category emotion breakdowns.',
  keywords: ['Face recognition', 'AI Face Analytics', 'Emotion Detection', 'TensorFlow.js', 'Next.js 14', 'Webcam Face Scanner'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        <GoogleProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
