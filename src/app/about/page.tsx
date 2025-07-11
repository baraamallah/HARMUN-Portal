import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Landmark } from 'lucide-react';
import Image from 'next/image';
import { getAboutPageContent } from '@/lib/firebase-service';
import { convertGoogleDriveLink } from '@/lib/utils';

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
            <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
                <Image
                    src={convertGoogleDriveLink(content.imageUrl)}
                    alt="Students engaged in a debate"
                    fill
                    className="object-cover"
                    data-ai-hint="students debate"
                />
            </div>
            <div>
                <h2 className="text-3xl font-bold font-headline text-foreground mb-4 flex items-center gap-3"><BookOpen className="w-8 h-8 text-primary"/> {content.whatIsTitle}</h2>
                <div className="space-y-4 text-muted-foreground">
                    <p>
                        {content.whatIsPara1}
                    </p>
                    <p>
                        {content.whatIsPara2}
                    </p>
                </div>
            </div>
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline text-foreground flex items-center gap-3"><Landmark className="w-8 h-8 text-primary" /> {content.storyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
            <p>
                {content.storyPara1}
            </p>
            <p>
                {content.storyPara2}
            </p>
            </CardContent>
        </Card>
        
        </div>
    </div>
  );
}
