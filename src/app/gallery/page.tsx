
import Image from 'next/image';
import { getGalleryPageContent, getGalleryItems } from '@/lib/firebase-service';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const aspectRatios: Record<string, string> = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
};

const colSpans: Record<string, string> = {
    'single': 'md:col-span-1',
    'double': 'md:col-span-2',
};

export default async function GalleryPage() {
    const [content, items] = await Promise.all([
        getGalleryPageContent(),
        getGalleryItems()
    ]);

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{content?.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {content?.subtitle}
                </p>
            </div>

            {items.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, index) => (
                        <Card key={item.id} className={cn(
                            "group animate-fade-in-up overflow-hidden",
                            colSpans[item.width]
                            )} style={{ animationDelay: `${index * 100}ms` }}>
                            <div className={cn("relative w-full overflow-hidden", aspectRatios[item.aspectRatio])}>
                                <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint="event photo"/>
                            </div>
                           <CardContent className="p-4">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                           </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
                    <p>No gallery items have been posted yet. Please check back soon!</p>
                </div>
            )}
        </div>
    );
}
