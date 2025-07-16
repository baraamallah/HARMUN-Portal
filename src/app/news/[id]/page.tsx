
import { getPostById, formatTimestamp } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

type NewsPostPageProps = {
    params: {
        id: string;
    }
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const post = await getPostById(params.id);

  if (!post || post.type !== 'news') {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-headline">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-4">
                <Calendar className="w-4 h-4"/>
                Published on {formatTimestamp(post.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-foreground text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    