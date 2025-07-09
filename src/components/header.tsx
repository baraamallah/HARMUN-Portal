"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteConfig } from '@/lib/types';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/committees', label: 'Committees' },
  { href: '/news', label: 'News' },
  { href: '/sg-notes', label: 'SG Notes' },
  { href: '/registration', label: 'Registration' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/secretariat', label: 'Secretariat' },
  { href: '/documents', label: 'Documents' },
];

export function AppHeader({ siteConfig }: { siteConfig: SiteConfig }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  const visibleNavLinks = navLinks.filter(
    link => siteConfig.navVisibility?.[link.href] !== false
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground font-headline">
          <Globe className="h-7 w-7 text-primary" />
          <span>HARMUN '25</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground',
                pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/registration">Register Now</Link>
          </Button>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground font-headline mb-4" onClick={() => setSheetOpen(false)}>
                  <Globe className="h-7 w-7 text-primary" />
                  <span>HARMUN '25</span>
                </Link>
                {visibleNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-4">
                  <Link href="/registration" onClick={() => setSheetOpen(false)}>Register Now</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
