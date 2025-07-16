
import { getPosts, formatTimestamp } from '@/lib/firebase-service';
import type { Post } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const newsPosts = await getPosts('news');

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">Conference News</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          The latest updates, announcements, and articles from the HARMUN team.
        </p>
      </div>

      {newsPosts.length > 0 ? (
        <div className="space-y-8 max-w-4xl mx-auto">
          {newsPosts.map((post: Post, index) => (
            <Card key={post.id} className="animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col" style={{ animationDelay: `${index * 150}ms` }}>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">{post.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2">
                    <Calendar className="w-4 h-4"/>
                    {formatTimestamp(post.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">{post.content}</p>
              </CardContent>
               <CardFooter>
                 <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="#">
                        Read More <ArrowRight className="w-4 h-4 ml-2"/>
                    </Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
          <p>No news articles have been posted yet. Please check back later!</p>
        </div>
      )}
    </div>
  );
}
