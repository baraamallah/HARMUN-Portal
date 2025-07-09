import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from '@/components/countdown';
import { Calendar, MapPin } from 'lucide-react';
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
          <div className="animate-fade-in-up animation-delay-300">
            <Button asChild size="lg">
              <Link href="/registration">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="bg-transparent py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2 font-headline text-primary-foreground">Conference Countdown</h2>
          <p className="text-muted-foreground mb-8">The next session is just around the corner.</p>
          <Countdown targetDate={conferenceDate} />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-transparent py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card>
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
            <Card>
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
            <Card>
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline">Venue Map</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13295.621718905126!2d35.37829399108886!3d33.58180460940153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151efaac9c5cdf6f%3A0x73a55ec5ecdc2fc2!2sRafic%20Hariri%20High%20School!5e0!3m2!1sen!2slb!4v1752039583301!5m2!1sen!2slb" 
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
