import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/app/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoCollect Tanzania | MWMA',
  description:
    'Mbeya Municipal Waste Management Authority — Digital Waste Collection Management System',
  keywords: ['waste management', 'Mbeya', 'Tanzania', 'MWMA', 'EcoCollect'],
  authors: [{ name: 'MWMA Digital Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f5238',
};

/**
 * Root Layout
 *
 * Initializes:
 * - Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono)
 * - TanStack Query provider (server-to-client data caching)
 * - AuthProvider (Supabase auth state → Zustand store sync)
 * - Global CSS design tokens and base styles
 * - Root ErrorBoundary (prevents blank-screen crashes)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans`}
    >
      <body className="antialiased bg-background text-on-surface selection:bg-primary/20 overflow-x-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('ServiceWorker forcefully unregistered to fix dev cache.');
                  }
                });
              }
            `,
          }}
        />
        <QueryProvider>
          <AuthProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
