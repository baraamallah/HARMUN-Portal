
import Image from 'next/image';
import { getGalleryPageContent, getGalleryItems } from '@/lib/firebase-service';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { convertGoogleDriveLink } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/lib/types';
import { Video } from 'lucide-react';

export const dynamic = 'force-dynamic';

function GalleryMedia({ item }: { item: GalleryItem }) {
    const itemContainerClasses = cn(
        "relative group overflow-hidden cursor-pointer w-full rounded-lg",
        "break-inside-avoid mb-4", // Added for better masonry layout
        {
            'aspect-video': item.display === '16:9',
            'aspect-[4/3]': item.display === '4:3',
            'aspect-square': item.display === '1:1' || item.display === 'circle',
            'aspect-[3/4]': item.display === '3:4',
            'aspect-[9/16]': item.display === '9:16',
            'aspect-[2/3]': item.display === '2:3',
            'rounded-full': item.display === 'circle',
        }
    );

    if (item.type === 'video') {
        return (
            <div className={itemContainerClasses}>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Video className="w-12 h-12 text-white" />
                </div>
                 <video
                    src={item.videoUrl || ''}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    loop
                    autoPlay
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <p className="absolute bottom-0 left-0 p-4 text-white font-semibold">{item.title}</p>
            </div>
        )
    }

    // Default to image
    const imageUrl = convertGoogleDriveLink(item.imageUrl || '');
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={itemContainerClasses}>
                    <Image
                        src={imageUrl}
                        alt={item.title}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="conference photo"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-0 left-0 p-4 text-white font-semibold">{item.title}</p>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-auto h-auto p-0 bg-transparent border-0 shadow-none flex items-center justify-center">
                <DialogTitle className="sr-only">{item.title}</DialogTitle>
                <DialogDescription className="sr-only">Enlarged view of the gallery image: {item.title}</DialogDescription>
                <Image
                     src={imageUrl}
                     alt={item.title}
                     width={1200}
                     height={800}
                     className="w-auto h-auto max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
                />
            </DialogContent>
        </Dialog>
    );
}

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
                 <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                           <GalleryMedia item={item} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
                    <p>No media has been added to the gallery yet.</p>
                </div>
            )}
        </div>
    );
}
