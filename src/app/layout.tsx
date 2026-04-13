import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import CustomCursor from '@/components/client/CustomCursor';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Adegheosa — Visual Artist · Lagos',
    template: '%s | Adegheosa',
  },
  description:
    'Adegheosa is a visual artist exploring the space between lifestyle, product, and emotion. From soft textures to bold portraits — capturing how we live, feel, and connect.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Adegheosa',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
