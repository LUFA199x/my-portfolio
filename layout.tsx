import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/client/CustomCursor';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Adegheosa — Lights, Lens & Vision',
    template: '%s | Adegheosa',
  },
  description:
    'Visual artist and photographer exploring the space between lifestyle, product, and emotion. Bold portraits, street photography, fashion shoots, and creative direction.',
  keywords: [
    'photographer',
    'Adegheosa',
    'portrait photography',
    'fashion photography',
    'street photography',
    'creative direction',
    'Lagos photographer',
    'visual artist',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Adegheosa — Lights, Lens & Vision',
    description:
      'Visual artist and photographer exploring the space between lifestyle, product, and emotion.',
    siteName: 'Adegheosa Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adegheosa — Lights, Lens & Vision',
    description:
      'Visual artist and photographer. Bold portraits, street, fashion, creative direction.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="grain">
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
