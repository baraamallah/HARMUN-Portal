
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Library, Calendar, MapPin } from 'lucide-react';
import { getHomePageContent, getHighlights, getRecentGalleryItems, getSiteConfig, getRecentNewsPosts, formatTimestamp } from '@/lib/firebase-service';
import { cn } from '@/lib/utils';
import { Countdown } from '@/components/countdown';
import { createDynamicIcon } from '@/components/dynamic-icon';
import type * as T from '@/lib/types';


export const dynamic = 'force-dynamic';

export default async function Home() {
  const [content, highlights, recentItems, siteConfig, recentNews] = await Promise.all([
    getHomePageContent(),
    getHighlights(),
    getRecentGalleryItems(3),
    getSiteConfig(),
    getRecentNewsPosts(3)
  ]);
  
  const targetDate = new Date(siteConfig.conferenceDate);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image
          src={content.heroImageUrl}
          alt="Delegates at a Model UN conference"
          fill
          className="z-0 object-cover"
          data-ai-hint="conference hall"
          priority
        />
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold mb-4 text-primary-foreground drop-shadow-lg animate-fade-in-down">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-primary-foreground/90 drop-shadow-md animate-fade-in-up">
            {content.heroSubtitle}
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Button asChild size="lg">
              <Link href="/registration">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>
      
       {/* Highlights & Map Section */}
      <section className="bg-secondary/50 py-16 md:py-20 border-b">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold font-headline text-foreground">{content.highlightsTitle}</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                {content.highlightsSubtitle}
              </p>
            </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Highlights */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
              {highlights.slice(0, 2).map((highlight, index) => (
                <div key={highlight.id} className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  {createDynamicIcon(highlight.icon, "w-10 h-10 mb-3 text-primary")}
                  <h3 className="text-xl font-bold">{highlight.title}</h3>
                  <p className="text-muted-foreground mt-1">{highlight.description}</p>
                </div>
              ))}
            </div>

            {/* Venue Map */}
            {siteConfig.mapEmbedUrl && (
              <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="aspect-video w-full rounded-lg overflow-hidden border shadow-lg">
                  <iframe
                    src={siteConfig.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Conference Venue Map"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="bg-background py-16 md:py-20 border-b">
         <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold font-headline text-foreground">The Countdown Begins</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Join us for an unforgettable experience. The next session is just around the corner.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <Countdown targetDate={targetDate} />
            </div>
        </div>
      </section>

      {/* Action Buttons Section */}
      <section className="bg-secondary/50 py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
             <Card className="p-6 flex flex-col items-center justify-center hover:border-primary/50 hover:-translate-y-1 transition-transform duration-300">
                <Library className="w-10 h-10 mb-2 text-primary"/>
                <h3 className="text-xl font-bold mb-2">Explore Committees</h3>
                <p className="text-muted-foreground mb-4">Discover the topics and chairs for each committee.</p>
                <Button asChild variant="outline">
                    <Link href="/committees">View Committees</Link>
                </Button>
             </Card>
             <Card className="p-6 flex flex-col items-center justify-center hover:border-primary/50 hover:-translate-y-1 transition-transform duration-300">
                <Calendar className="w-10 h-10 mb-2 text-primary"/>
                <h3 className="text-xl font-bold mb-2">Conference Schedule</h3>
                <p className="text-muted-foreground mb-4">Plan your days with our detailed event schedule.</p>
                <Button asChild variant="outline">
                    <Link href="/schedule">See Schedule</Link>
                </Button>
             </Card>
          </div>
        </div>
      </section>

       {/* News Preview Section */}
      {recentNews.length > 0 && (
        <section className="bg-background py-20 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold font-headline text-foreground">Latest News</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Stay up to date with the latest announcements from the HARMUN team.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNews.map((post: T.Post, index) => (
                <Card key={post.id} className="animate-fade-in-up flex flex-col" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader>
                    <CardTitle className="text-xl font-headline">{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                        <Calendar className="w-4 h-4"/>
                        {formatTimestamp(post.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href={`/news/${post.id}`}>
                            Read More <ArrowRight className="w-4 h-4 ml-2"/>
                        </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
                <Button asChild size="lg" variant="ghost">
                    <Link href="/news">
                        View All News <ArrowRight className="w-4 h-4 ml-2"/>
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Preview Section */}
      {recentItems.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold font-headline text-foreground">From the Gallery</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                A glimpse into the memorable moments of our conference.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentItems.map((item, index) => (
                <Card key={item.id} className={cn(
                  "group animate-fade-in-up overflow-hidden",
                )} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      data-ai-hint="event photo"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
                <Button asChild size="lg" variant="ghost">
                    <Link href="/gallery">
                        View Full Gallery <ArrowRight className="w-4 h-4 ml-2"/>
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
