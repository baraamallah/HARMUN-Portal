import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Committee } from '@/lib/types';
import { FileText, User } from 'lucide-react';

const committees: Committee[] = [
  {
    name: 'Security Council (SC)',
    chair: {
      name: 'Dr. Evelyn Reed',
      bio: 'An expert in international security with 15 years of experience at the UN.',
      imageUrl: 'https://placehold.co/400x400.png',
    },
    topics: ['Cyber Warfare and International Law', 'The Situation in the Arctic Circle'],
    backgroundGuideUrl: '#',
  },
  {
    name: 'World Health Organization (WHO)',
    chair: {
      name: 'Dr. Ben Carter',
      bio: 'A leading epidemiologist from the Global Health Institute.',
      imageUrl: 'https://placehold.co/400x400.png',
    },
    topics: ['Pandemic Preparedness and Response', 'Mental Health in a Post-Pandemic World'],
    backgroundGuideUrl: '#',
  },
  {
    name: 'Human Rights Council (HRC)',
    chair: {
      name: 'Aisha Khan',
      bio: 'A human rights lawyer who has worked with multiple international NGOs.',
      imageUrl: 'https://placehold.co/400x400.png',
    },
    topics: ['Protecting Freedom of Speech Online', 'The Rights of Climate Refugees'],
    backgroundGuideUrl: '#',
  },
    {
    name: 'United Nations Environment Programme (UNEP)',
    chair: {
      name: 'Kenji Tanaka',
      bio: 'A climate scientist and advocate for sustainable development policies.',
      imageUrl: 'https://placehold.co/400x400.png',
    },
    topics: ['Financing the Green Transition', 'Combating Plastic Pollution in Oceans'],
    backgroundGuideUrl: '#',
  },
];

export default function CommitteesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Our Committees</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the diverse range of committees at HARMUN 2025. Each committee offers a unique challenge and opportunity for debate.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {committees.map((committee) => (
          <Card key={committee.name} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">{committee.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={committee.chair.imageUrl}
                    alt={`Photo of ${committee.chair.name}`}
                    width={100}
                    height={100}
                    className="rounded-full"
                    data-ai-hint="person portrait"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><User className="w-5 h-5 text-primary" />{committee.chair.name} (Chair)</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{committee.chair.bio}</p>
                  <h4 className="font-semibold mb-2">Topics:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {committee.topics.map((topic) => <li key={topic}>{topic}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href={committee.backgroundGuideUrl} download>
                  <FileText className="mr-2 h-4 w-4" />
                  Download Background Guide
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
