import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { getSiteConfig } from '@/lib/firebase-service';
import type { SiteConfig } from '@/lib/types';
import { AuthProvider } from '@/context/auth-context';
import { Analytics } from '@vercel/analytics/react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HARMUN 2025 Portal',
  description: 'The official portal for the Harvard Model United Nations 2025 conference.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();

  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader siteConfig={siteConfig} />
            <main className="flex-grow">{children}</main>
            <AppFooter siteConfig={siteConfig} />
          </div>
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
