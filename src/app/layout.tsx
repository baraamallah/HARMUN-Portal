import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { getTheme } from '@/lib/firebase-service';
import type { Theme } from '@/lib/types';

export const metadata: Metadata = {
  title: 'HARMUN 2025 Portal',
  description: 'The official portal for the Harvard Model United Nations 2025 conference.',
};

// This component dynamically injects CSS variables based on the theme from Firestore.
const DynamicThemeStyle = ({ theme }: { theme: Theme }) => {
  // We only override the colors managed by the admin panel.
  // The rest of the theme values in globals.css remain as fallbacks.
  const css = `
    :root {
      --background: ${theme.backgroundColor};
      --primary: ${theme.primaryColor};
      --accent: ${theme.accentColor};
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();

  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <DynamicThemeStyle theme={theme} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-grow">{children}</main>
          <AppFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
