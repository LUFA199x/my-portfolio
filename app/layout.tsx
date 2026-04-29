import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

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
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
