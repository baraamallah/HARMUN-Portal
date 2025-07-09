import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SecretariatMember } from '@/lib/types';

const secretariatMembers: SecretariatMember[] = [
  {
    name: 'James Harrison',
    role: 'Secretary-General',
    bio: 'A senior at Harvard studying Government and Economics. This is his fourth and final HARMUN, and he is thrilled to lead an unforgettable conference experience.',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    name: 'Chloe Davis',
    role: 'Director-General',
    bio: 'A junior concentrating in History & Literature. Chloe oversees all committee operations and is dedicated to ensuring a high level of debate and engagement.',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    name: 'Brian Rodriguez',
    role: 'Under-Secretary-General for Administration',
    bio: 'A sophomore in Computer Science. Brian manages the technical infrastructure and logistics that make HARMUN possible, from the website to the on-site tech.',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    name: 'Sophia Chen',
    role: 'Under-Secretary-General for Finance',
    bio: 'A junior studying Applied Mathematics. Sophia is responsible for the financial health of the conference, managing budgets and sponsorships.',
    imageUrl: 'https://placehold.co/400x400.png',
  },
];

export default function SecretariatPage() {
  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Meet the Secretariat</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            The dedicated team working behind the scenes to make HARMUN 2025 a reality.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {secretariatMembers.map((member) => (
            <Card key={member.name} className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <Avatar className="w-32 h-32 mb-4 border-4 border-primary/10">
                  <AvatarImage src={member.imageUrl} alt={`Photo of ${member.name}`} data-ai-hint="person portrait" />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-headline">{member.name}</CardTitle>
                <CardDescription className="text-primary font-semibold">{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
