import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IdealFounders - Co-founder & Investor Matchmaking',
  description: 'Connect with co-founders and investors through skill-based algorithmic matching',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased bg-background min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
