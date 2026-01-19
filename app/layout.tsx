import type { Metadata, Viewport } from 'next';
import './globals.css';

/* ✅ Viewport + themeColor MUST be here */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0F',
};

/* ✅ Metadata WITHOUT viewport/themeColor */
export const metadata: Metadata = {
  metadataBase: new URL('https://barracuda.marketing'),
  title: {
    default: 'Barracuda Marketing - Premier Casino Affiliate Network',
    template: '%s | Barracuda Marketing',
  },
  description:
    'Join Barracuda Marketing, the leading casino affiliate network. Partner with top-tier iGaming brands and maximize your earnings with premium offers.',
  keywords: [
    'casino affiliate',
    'iGaming network',
    'affiliate marketing',
    'online casino',
    'gaming affiliates',
    'revenue share',
    'CPA offers',
    'barracuda marketing',
  ],
  authors: [{ name: 'Barracuda Marketing' }],
  creator: 'Barracuda Marketing',
  publisher: 'Barracuda Marketing',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://barracuda.marketing',
    siteName: 'Barracuda Marketing',
    title: 'Barracuda Marketing - Premier Casino Affiliate Network',
    description:
      'Join Barracuda Marketing, the leading casino affiliate network. Maximize your earnings with premium iGaming offers.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Barracuda Marketing - Casino Affiliate Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barracuda Marketing - Premier Casino Affiliate Network',
    description:
      'Join Barracuda Marketing, the leading casino affiliate network. Maximize your earnings with premium iGaming offers.',
    images: ['/images/og-image.jpg'],
    creator: '@barracudamarketing',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-text antialiased">
        {children}
      </body>
    </html>
  );
}
