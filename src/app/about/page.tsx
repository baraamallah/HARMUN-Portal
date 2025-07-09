import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Landmark } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">About HARMUN</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the history, mission, and spirit of the Harvard Model United Nations conference.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
                <Image
                    src="https://placehold.co/600x400.png"
                    alt="Students engaged in a debate"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="students debate"
                />
            </div>
            <div>
                <h2 className="text-3xl font-bold font-headline text-primary mb-4 flex items-center gap-3"><BookOpen className="w-8 h-8"/> What is Model UN?</h2>
                <div className="space-y-4 text-muted-foreground">
                    <p>
                        Model United Nations is an academic simulation of the United Nations where students play the role of delegates from different countries and attempt to solve real world issues with the policies and perspectives of their assigned country.
                    </p>
                    <p>
                        Participants learn about diplomacy, international relations, and the United Nations. Delegates are placed in committees and assigned countries, research topics, and formulate positions to debate with their peers, staying true to the actual position of the country they represent.
                    </p>
                </div>
            </div>
        </div>

        <Card className="bg-secondary/50 border-primary/20">
            <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline text-primary flex items-center gap-3"><Landmark className="w-8 h-8" /> The Story of HARMUN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
            <p>
                Harvard Model United Nations (HARMUN) was founded in 1953, only a few years after the creation of the United Nations itself. It was conceived as a platform to educate the next generation of leaders about the complexities of international affairs and the importance of diplomacy. From its humble beginnings, HARMUN has grown into one of the largest, oldest, and most prestigious conferences of its kind in the world.
            </p>
            <p>
                Each year, HARMUN brings together over 3,000 high school students from across the globe to our campus in Cambridge. Our mission is to provide a dynamic and engaging educational experience that promotes a deeper understanding of the world, fosters a spirit of collaboration, and inspires a commitment to global citizenship. The conference is entirely run by Harvard undergraduates who are passionate about international relations and dedicated to creating a memorable and impactful experience for every delegate.
            </p>
            </CardContent>
        </Card>
        
        </div>
    </div>
  );
}
