
import { getPostById, formatTimestamp, getSiteConfig } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const dynamic = 'force-dynamic';

type SGNotePageProps = {
    params: {
        id: string;
    }
}

export default async function SGNotePage({ params }: SGNotePageProps) {
  const [post, siteConfig] = await Promise.all([
    getPostById(params.id),
    getSiteConfig()
  ]);

  if (!post || post.type !== 'sg-note') {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Card className="animate-fade-in-up">
          <CardHeader>
             <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/50">
                    <AvatarImage src={siteConfig.sgAvatarUrl} alt="Secretary-General" data-ai-hint="person portrait" />
                    <AvatarFallback>SG</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">A Note from the Secretary-General</p>
                    <CardTitle className="text-3xl md:text-4xl font-headline mt-1">{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                        <Calendar className="w-4 h-4"/>
                        {formatTimestamp(post.createdAt)}
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="prose dark:prose-invert max-w-none text-foreground text-base leading-relaxed whitespace-pre-wrap pt-4 border-t">
              {post.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
