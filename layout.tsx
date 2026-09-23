import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { PwaRegistration } from '@/components/shared/PwaRegistration';

export const metadata: Metadata = {
  title: 'ANKI TURBINADO — Sistema Operacional de Estudos',
  description: 'Plataforma completa de estudos, repetição espaçada com FSRS, questões e IA para concursos.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Anki Turbinado',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <AuthProvider>
          <PwaRegistration />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
