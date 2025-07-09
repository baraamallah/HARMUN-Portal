import { Globe, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import type { SiteConfig } from '@/lib/types';

export function AppFooter({ siteConfig }: { siteConfig: SiteConfig }) {
  const { twitter, instagram, facebook } = siteConfig.socialLinks;

  return (
    <footer className="bg-secondary border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary font-headline">
            <Globe className="h-7 w-7" />
            <span>HARMUN 2025</span>
          </Link>

          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HARMUN. All Rights Reserved.</p>
            <p>{siteConfig.footerText}</p>
          </div>

          <div className="flex items-center space-x-2">
            {twitter && twitter !== '#' && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {instagram && instagram !== '#' && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {facebook && facebook !== '#' && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
