import './globals.css'

export const metadata = {
  title: 'Swayam Korde',
  description:
    'Swayam Korde, web developer. Frontend-focused, product-minded. Building thoughtful, interactive products with modern web technologies.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  themeColor: '#08070B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
