import { Metadata } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard - Barracuda Marketing',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Admin Dashboard - Barracuda Marketing</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-text antialiased">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}

