
import Image from 'next/image';
import { getGalleryPageContent, getGalleryItems } from '@/lib/firebase-service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
                        <Dialog key={item.id}>
                            <DialogTrigger asChild>
                                <div className={cn(
                                    "group relative animate-fade-in-up cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden",
                                    colSpans[item.width]
                                    )} style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className={cn("relative w-full", aspectRatios[item.aspectRatio])}>
                                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" data-ai-hint="event photo"/>
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                                        <h3 className="text-white font-bold text-lg text-center">{item.title}</h3>
                                    </div>
                                </div>
                            </DialogTrigger>
                             <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">{item.title}</DialogTitle>
                                    {item.description && <DialogDescription className="pt-2">{item.description}</DialogDescription>}
                                </DialogHeader>
                                <div className={cn("relative mt-4", aspectRatios[item.aspectRatio])}>
                                     <Image src={item.imageUrl} alt={item.title} fill className="object-contain rounded-md" data-ai-hint="event photo"/>
                                </div>
                            </DialogContent>
                        </Dialog>
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
