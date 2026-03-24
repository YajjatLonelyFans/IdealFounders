import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IdealFounders — Elevate Your Startup Journey',
  description: 'Find your perfect co-founder or investor through advanced algorithmic matching. No swiping, just meaningful connections built for success.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased bg-background min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
