import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from '@/components/countdown';
import { Calendar, MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
import { getHomePageContent, getSiteConfig } from '@/lib/firebase-service';

export default async function Home() {
  const [content, siteConfig] = await Promise.all([
    getHomePageContent(),
    getSiteConfig(),
  ]);

  const conferenceDate = new Date(siteConfig.conferenceDate);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-primary/80 z-10" />
        <Image
          src={content.heroImageUrl}
          alt="Conference hall"
          fill
          className="z-0 object-cover"
          data-ai-hint="conference hall"
          priority
        />
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold mb-4 drop-shadow-lg animate-fade-in-down">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 drop-shadow-md animate-fade-in-up">
            {content.heroSubtitle}
          </p>
          <div className="animate-fade-in-up animation-delay-300">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/registration">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="bg-background py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2 font-headline text-primary">Conference Countdown</h2>
          <p className="text-muted-foreground mb-8">The next session is just around the corner.</p>
          <Countdown targetDate={conferenceDate} />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline">Conference Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">January 30 - February 2, 2025</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Harvard University, Cambridge, MA</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline">Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Innovating Global Governance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
