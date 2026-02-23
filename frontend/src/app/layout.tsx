// frontend/src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Poppins, Righteous } from 'next/font/google';
import { Navbar } from '@/widgets/navbar';
import { Toaster } from '@/shared/ui/sonner';
import { APP_NAME } from '@/shared/config';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const righteous = Righteous({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-righteous',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Concert Tickets Booking`,
  description: 'Browse and reserve concert tickets easily',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#EFF6FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${righteous.variable} font-sans antialiased`}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
