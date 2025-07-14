import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from '@/components/countdown';
import { Calendar, MapPin, type LucideIcon, type LucideProps } from 'lucide-react';
import * as icons from 'lucide-react';
import Image from 'next/image';
import { getHomePageContent, getSiteConfig, getHighlights } from '@/lib/firebase-service';
import type { ConferenceHighlight } from '@/lib/types';

export const dynamic = 'force-dynamic';

const Icon = ({ name, ...props }: { name: string } & LucideProps) => {
  const LucideIcon = (icons as unknown as Record<string, LucideIcon>)[name];
  if (!LucideIcon) {
    return <icons.HelpCircle {...props} />; // Fallback icon
  }
  return <LucideIcon {...props} />;
};


export default async function Home() {
  const [content, siteConfig, highlights] = await Promise.all([
    getHomePageContent(),
    getSiteConfig(),
    getHighlights(),
  ]);

  const conferenceDate = new Date(siteConfig.conferenceDate);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <Image
          src={content.heroImageUrl}
          alt="Conference hall"
          fill
          className="z-0 object-cover"
          data-ai-hint="conference hall"
          priority
        />
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold mb-4 text-primary-foreground drop-shadow-lg animate-fade-in-down">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-primary-foreground/80 drop-shadow-md animate-fade-in-up">
            {content.heroSubtitle}
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Button asChild size="lg">
              <Link href="/registration">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="bg-transparent py-16 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2 font-headline text-foreground">Conference Countdown</h2>
          <p className="text-muted-foreground mb-8">The next session is just around the corner.</p>
          <Countdown targetDate={conferenceDate} />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-transparent py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {highlights.map((highlight, index) => (
               <Card key={highlight.id} className="animate-fade-in-up transition-all duration-300 hover:border-primary hover:-translate-y-1" style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Icon name={highlight.icon} className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-headline">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
             <Card className="animate-fade-in-up transition-all duration-300 hover:border-primary hover:-translate-y-1" style={{ animationDelay: `${highlights.length * 150}ms` }}>
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline">Venue Map</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe 
                    src={siteConfig.mapEmbedUrl} 
                    className="w-full h-48 border-0 rounded-md"
                    allowFullScreen={true}
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
