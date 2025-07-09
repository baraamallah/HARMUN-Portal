import { Globe, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function AppFooter() {
  return (
    <footer className="bg-secondary border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-primary font-headline mb-4 md:mb-0">
            <Globe className="h-7 w-7" />
            <span>HARMUN 2025</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HARMUN. All Rights Reserved.</p>
          <p>This is a fictional event created for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
