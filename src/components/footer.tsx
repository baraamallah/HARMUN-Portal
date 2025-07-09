
import { Globe, Twitter, Instagram, Facebook, Linkedin, Youtube, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import type { SiteConfig } from '@/lib/types';

const platformIcons: Record<string, LucideIcon> = {
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
};

export function AppFooter({ siteConfig }: { siteConfig: SiteConfig }) {
  // Handle legacy socialLinks object format for backward compatibility
  const socialLinksArray = Array.isArray(siteConfig.socialLinks)
    ? siteConfig.socialLinks
    : [];

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground font-headline">
            <Globe className="h-7 w-7 text-primary" />
            <span>HARMUN 2025</span>
          </Link>

          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HARMUN. All Rights Reserved.</p>
            <p>{siteConfig.footerText}</p>
          </div>

          <div className="flex items-center space-x-2">
            {socialLinksArray.map(({ platform, url }) => {
                const Icon = platformIcons[platform];
                if (!Icon || !url || url === '#') {
                    return null;
                }
                return (
                    <Button variant="ghost" size="icon" asChild key={platform}>
                        <Link href={url} aria-label={platform} target="_blank" rel="noopener noreferrer">
                        <Icon className="h-5 w-5" />
                        </Link>
                    </Button>
                );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
