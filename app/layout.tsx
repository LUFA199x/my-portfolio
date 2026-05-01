import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ARHDAY | Adegheosa Photography',
  description: "Visual artist exploring the space between lifestyle, product, and portrait photography. Based in Lagos.",
  keywords: ['photography', 'portrait', 'fashion', 'Lagos', 'Adegheosa'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
