"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getGalleryPageContent, getGalleryImages } from '@/lib/firebase-service';
import type { GalleryPageContent, GalleryImage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

export default function GalleryPage() {
    const [content, setContent] = useState<GalleryPageContent | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [pageContent, galleryImages] = await Promise.all([
                    getGalleryPageContent(),
                    getGalleryImages()
                ]);
                setContent(pageContent);
                setImages(galleryImages);
            } catch (error) {
                console.error("Failed to load gallery page data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    
    if (loading) {
        return (
             <div className="container mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                </div>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full mb-4" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{content?.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {content?.subtitle}
                </p>
            </div>
            
            {images.length > 0 ? (
                 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {images.map((image, index) => (
                         <Dialog key={image.id}>
                            <DialogTrigger asChild>
                                <div className="break-inside-avoid relative group overflow-hidden rounded-lg cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.title}
                                        width={500}
                                        height={500}
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        unoptimized // Required for Google Drive links which may not have standard extensions
                                        data-ai-hint="conference photo"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <p className="absolute bottom-0 left-0 p-4 text-white font-semibold">{image.title}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
                                <Image
                                     src={image.imageUrl}
                                     alt={image.title}
                                     width={1200}
                                     height={800}
                                     className="w-full h-auto rounded-md object-contain"
                                     unoptimized
                                />
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
                    <p>No images have been added to the gallery yet.</p>
                </div>
            )}
        </div>
    );
}
