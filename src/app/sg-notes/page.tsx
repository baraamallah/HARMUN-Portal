import { getPosts, formatTimestamp } from '@/lib/firebase-service';
import type { Post } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';

export default async function SGNotesPage() {
  const sgNotes = await getPosts('sg-note');

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground">A Note from the Secretary-General</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights, updates, and messages from the leader of HARMUN 2025.
        </p>
      </div>

      {sgNotes.length > 0 ? (
        <div className="space-y-8 max-w-4xl mx-auto">
          {sgNotes.map((post: Post) => (
            <Card key={post.id}>
              <CardHeader>
                 <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 border">
                        <AvatarImage src="https://placehold.co/400x400.png" alt="Secretary-General" data-ai-hint="person portrait" />
                        <AvatarFallback>SG</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl font-headline">{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1">
                            <Calendar className="w-4 h-4"/>
                            {formatTimestamp(post.createdAt)}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>No notes have been posted yet. Please check back later!</p>
        </div>
      )}
    </div>
  );
}
