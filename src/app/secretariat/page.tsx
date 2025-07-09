import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSecretariat } from '@/lib/firebase-service';

export default async function SecretariatPage() {
  const secretariatMembers = await getSecretariat();

  return (
    <div className="bg-transparent">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">Meet the Secretariat</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            The dedicated team working behind the scenes to make HARMUN 2025 a reality.
          </p>
        </div>

        {secretariatMembers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {secretariatMembers.map((member, index) => (
              <Card key={member.id} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="items-center">
                  <Avatar className="w-32 h-32 mb-4 border-4 border-primary/20">
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
        ) : (
            <div className="text-center py-16 text-muted-foreground animate-fade-in-up">
                <p>Secretariat members have not been announced yet. Please check back soon!</p>
            </div>
        )}
      </div>
    </div>
  );
}
