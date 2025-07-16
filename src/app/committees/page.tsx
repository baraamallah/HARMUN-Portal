
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getCommittees } from '@/lib/firebase-service';
import type { Committee } from '@/lib/types';
import { FileText, User, Mic } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CommitteesPage() {
  const committees = await getCommittees();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">Our Committees</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the diverse range of committees at HARMUN 2025. Each committee offers a unique challenge and opportunity for debate.
        </p>
      </div>

      {committees.length > 0 ? (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {committees.map((committee, index) => (
            <Card key={committee.id} className="flex flex-col animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1" style={{ animationDelay: `${index * 150}ms` }}>
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-foreground">{committee.name}</CardTitle>
                <div className="flex items-center gap-3 pt-2">
                   <div className="flex-shrink-0">
                    <Image
                      src={committee.chair.imageUrl}
                      alt={`Photo of ${committee.chair.name}`}
                      width={64}
                      height={64}
                      className="rounded-full object-cover border-2 border-primary/50"
                      data-ai-hint="person portrait"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><User className="w-5 h-5 text-primary" />{committee.chair.name}</h3>
                    <p className="text-sm text-muted-foreground">Committee Chair</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">"{committee.chair.bio}"</p>
                
                {committee.topics.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Mic className="w-5 h-5 text-primary" /> Topics of Debate:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                        {committee.topics.map((topic) => <li key={topic}>{topic}</li>)}
                        </ul>
                    </div>
                )}
              </CardContent>
              <CardFooter>
                 {committee.backgroundGuideUrl ? (
                    <Button asChild className="w-full">
                        <a href={committee.backgroundGuideUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            Download Background Guide
                        </a>
                    </Button>
                 ) : (
                    <Button className="w-full" disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        Background Guide Not Available
                    </Button>
                 )}
              </CardFooter>
            </Card>
          ))}
        </div>
        ) : (
        <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
            <p>Committees have not been announced yet. Please check back soon!</p>
        </div>
      )}
    </div>
  );
}
