
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Landmark } from 'lucide-react';
import Image from 'next/image';
import { getAboutPageContent } from '@/lib/firebase-service';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <div className="bg-transparent">
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{content.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                {content.subtitle}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl group">
                     <Image
                        src={content.imageUrl}
                        alt="Students engaged in a debate"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint="students debate"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold font-headline text-foreground mb-4 flex items-center gap-3"><BookOpen className="w-8 h-8 text-primary"/> {content.whatIsTitle}</h2>
                    <div className="space-y-4 text-muted-foreground text-base">
                        <p>{content.whatIsPara1}</p>
                        <p>{content.whatIsPara2}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                 <div className="space-y-4 md:order-2">
                    <h2 className="text-3xl font-bold font-headline text-foreground mb-4 flex items-center gap-3"><Landmark className="w-8 h-8 text-primary"/> {content.storyTitle}</h2>
                    <div className="space-y-4 text-muted-foreground text-base">
                        <p>{content.storyPara1}</p>
                        <p>{content.storyPara2}</p>
                    </div>
                </div>
                <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl md:order-1 group">
                    <Image
                        src={content.storyImageUrl}
                        alt="Harvard campus building"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint="university campus"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
            </div>
        
        </div>
    </div>
  );
}

    