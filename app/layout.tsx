import React from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
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
  title: 'EcoCollect Tanzania | TMWA',
  description: 'Government-Grade Digital Waste Collection Management System for Tanzania',
};

/**
 * Root Layout that initializes fonts, Global Providers, and standard tailwind base styles.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans`}
    >
      <body className="antialiased bg-[#fcf8fb] text-[#1b1b1d] selection:bg-primary/20">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
